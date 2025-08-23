using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Core.Utilities.Results;
using Core.Utilities.Business; // İş motoru helper
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Category;
using Yazilimxyz.BusinessLayer.Constans;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class CategoryManager : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMapper _mapper;

        public CategoryManager(ICategoryRepository categoryRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultCategoryDto>>> GetAllWithRelationsAsync()
        {
            if (DateTime.Now.Hour == 1)
                return new ErrorDataResult<List<ResultCategoryDto>>(Messages.TenanceTime);

            var categories = await _categoryRepository.GetAllWithRelationsAsync();
            var mapped = _mapper.Map<List<ResultCategoryDto>>(categories);
            return new SuccessDataResult<List<ResultCategoryDto>>(mapped, Messages.CategoriesListed);
        }

        [CacheAspect]
        public async Task<IDataResult<ResultCategoryDto>> GetByIdAsync(int id)
        {
            var category = await _categoryRepository.GetByIdWithRelationsAsync(id);
            if (category == null)
                return new ErrorDataResult<ResultCategoryDto>(Messages.CategoryNotFound);

            var mapped = _mapper.Map<ResultCategoryDto>(category);
            return new SuccessDataResult<ResultCategoryDto>(mapped);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultCategoryDto>>> GetActiveAsync()
        {
            var categories = await _categoryRepository.GetActiveAsync();
            var mapped = _mapper.Map<List<ResultCategoryDto>>(categories);
            return new SuccessDataResult<List<ResultCategoryDto>>(mapped);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultCategoryDto>>> GetParentCategoriesAsync()
        {
            var categories = await _categoryRepository.GetParentCategoriesAsync();
            var mapped = _mapper.Map<List<ResultCategoryDto>>(categories);
            return new SuccessDataResult<List<ResultCategoryDto>>(mapped);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultCategoryDto>>> GetSubCategoriesAsync(int parentId)
        {
            var categories = await _categoryRepository.GetSubCategoriesAsync(parentId);
            var mapped = _mapper.Map<List<ResultCategoryDto>>(categories);
            return new SuccessDataResult<List<ResultCategoryDto>>(mapped);
        }

        [CacheAspect]
        public async Task<IDataResult<ResultCategoryWithSubDto>> GetWithSubCategoriesAsync(int id)
        {
            var category = await _categoryRepository.GetWithSubCategoriesAsync(id);
            if (category == null)
                return new ErrorDataResult<ResultCategoryWithSubDto>(Messages.CategoryNotFound);

            var mapped = _mapper.Map<ResultCategoryWithSubDto>(category);
            return new SuccessDataResult<ResultCategoryWithSubDto>(mapped);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultCategoryHierarchyDto>>> GetCategoryHierarchyAsync()
        {
            var categories = await _categoryRepository.GetCategoryHierarchyAsync();
            var mapped = _mapper.Map<List<ResultCategoryHierarchyDto>>(categories);
            return new SuccessDataResult<List<ResultCategoryHierarchyDto>>(mapped);
        }

        [CacheRemoveAspect("ICategoryService.Get")]
        public async Task<IResult> CreateAsync(CreateCategoryDto dto)
        {
            // 1) Senkron kurallar (BusinessRules.Run ile)
            var syncRuleResult = BusinessRules.Run(
                CheckIfNameValid(dto?.Name),
                CheckIfSortOrderValid(dto?.SortOrder),
                CheckIfParentIdNonNegative(dto?.ParentCategoryId)
            );
            if (syncRuleResult != null)
                return syncRuleResult;

            // 2) Asenkron kurallar (repo erişimi gerektirir)
            var asyncRuleResult = await BusinessRunAsync(
                CheckIfParentExistsAsync(dto?.ParentCategoryId),
                CheckIfCategoryNameExistsAsync(dto!.Name),
                CheckIfCategoryLimitExceededAsync()
            );
            if (asyncRuleResult != null)
                return asyncRuleResult;

            var category = _mapper.Map<Category>(dto);
            await _categoryRepository.AddAsync(category);
            return new SuccessResult(Messages.CategoryAdded);
        }

        [CacheRemoveAspect("ICategoryService.Get")]
        public async Task<IResult> UpdateAsync(UpdateCategoryDto dto)
        {
            // 1) Senkron kurallar
            var syncRuleResult = BusinessRules.Run(
                CheckIfNameValid(dto?.Name),
                CheckIfSortOrderValid(dto?.SortOrder),
                CheckIfParentIdNonNegative(dto?.ParentCategoryId)
            );
            if (syncRuleResult != null)
                return syncRuleResult;

            var existing = await _categoryRepository.GetByIdAsync(dto!.Id);
            if (existing == null)
                return new ErrorResult(Messages.CategoryNotFound);

            // 2) Asenkron kurallar
            var asyncRuleResult = await BusinessRunAsync(
                CheckIfParentExistsAsync(dto.ParentCategoryId),
                CheckIfCategoryNameExistsForAnotherAsync(dto.Name!, dto.Id)
            );
            if (asyncRuleResult != null)
                return asyncRuleResult;

            _mapper.Map(dto, existing);
            await _categoryRepository.UpdateAsync(existing);
            return new SuccessResult(Messages.CategoryUpdated);
        }

        [CacheRemoveAspect("ICategoryService.Get")]
        public async Task<IResult> DeleteAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                return new ErrorResult(Messages.CategoryNotFound);

            await _categoryRepository.DeleteAsync(id);
            return new SuccessResult(Messages.CategoryDeleted);
        }

        // =======================
        // İş Motoru Fonksiyonları
        // =======================

        // Senkron validasyonlar (BusinessRules.Run ile direkt çalışır)
        private IResult CheckIfNameValid(string? name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return new ErrorResult("Geçersiz istek.");
            if (name.Length < 2)
                return new ErrorResult("Kategori adı en az 2 karakter olmalıdır.");
            return new SuccessResult();
        }

        private IResult CheckIfSortOrderValid(int? sortOrder)
        {
            if (!sortOrder.HasValue)
                return new ErrorResult("Sıralama değeri zorunludur.");
            if (sortOrder.Value < 0)
                return new ErrorResult("Sıralama değeri negatif olamaz.");
            return new SuccessResult();
        }

        private IResult CheckIfParentIdNonNegative(int? parentId)
        {
            if (parentId.HasValue && parentId.Value < 0)
                return new ErrorResult("Ana kategori Id negatif olamaz.");
            return new SuccessResult();
        }

        // Asenkron kurallar (repo erişimi)
        private async Task<IResult> CheckIfParentExistsAsync(int? parentId)
        {
            if (!parentId.HasValue) return new SuccessResult();
            var exists = await _categoryRepository.AnyAsync(c => c.Id == parentId.Value);
            if (!exists)
                return new ErrorResult("Geçersiz ParentCategoryId. Böyle bir üst kategori bulunamadı.");
            return new SuccessResult();
        }

        private async Task<IResult> CheckIfCategoryNameExistsAsync(string name)
        {
            var exists = await _categoryRepository.AnyAsync(c => c.Name.ToLower() == name.ToLower());
            if (exists)
                return new ErrorResult(Messages.CategoryNameAlreadyExists);
            return new SuccessResult();
        }

        private async Task<IResult> CheckIfCategoryNameExistsForAnotherAsync(string name, int currentId)
        {
            var clash = await _categoryRepository.AnyAsync(c => c.Name.ToLower() == name.ToLower() && c.Id != currentId);
            if (clash)
                return new ErrorResult(Messages.CategoryNameAlreadyExists);
            return new SuccessResult();
        }

        private async Task<IResult> CheckIfCategoryLimitExceededAsync()
        {
            var count = await _categoryRepository.CountAsync();
            if (count >= 100)
                return new ErrorResult(Messages.CategoryLimitExceeded);
            return new SuccessResult();
        }

        // 1. sınıftaki BusinessRules.Run akışına benzer şekilde
        // asenkron kurallar için ilk hatayı döndüren küçük yardımcı.
        private static async Task<IResult?> BusinessRunAsync(params Task<IResult>[] rules)
        {
            foreach (var rule in rules)
            {
                var result = await rule;
                if (!result.Success)
                    return result;
            }
            return null;
        }
    }
}
