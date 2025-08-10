using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Core.Utilities.Results;
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

        [CacheAspect] // key, value
        public async Task<IDataResult<List<ResultCategoryDto>>> GetAllAsync()
        {
            if (DateTime.Now.Hour == 1)
            {
                return new ErrorDataResult<List<ResultCategoryDto>>(Messages.TenanceTime);
            }

            var categories = await _categoryRepository.GetAllAsync();
            var mapped = _mapper.Map<List<ResultCategoryDto>>(categories);
            return new SuccessDataResult<List<ResultCategoryDto>>(mapped, Messages.CategoriesListed);
        }

        [CacheAspect] // key, value
        public async Task<IDataResult<ResultCategoryDto>> GetByIdAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                return new ErrorDataResult<ResultCategoryDto>(Messages.CategoryNotFound);
            }

            var mapped = _mapper.Map<ResultCategoryDto>(category);
            return new SuccessDataResult<ResultCategoryDto>(mapped);
        }

        [CacheAspect] // key, value
        public async Task<IDataResult<List<ResultCategoryDto>>> GetActiveAsync()
        {
            var categories = await _categoryRepository.GetActiveAsync();
            var mapped = _mapper.Map<List<ResultCategoryDto>>(categories);
            return new SuccessDataResult<List<ResultCategoryDto>>(mapped);
        }

        [CacheAspect] // key, value
        public async Task<IDataResult<List<ResultCategoryDto>>> GetParentCategoriesAsync()
        {
            var categories = await _categoryRepository.GetParentCategoriesAsync();
            var mapped = _mapper.Map<List<ResultCategoryDto>>(categories);
            return new SuccessDataResult<List<ResultCategoryDto>>(mapped);
        }

        [CacheAspect] // key, value
        public async Task<IDataResult<List<ResultCategoryDto>>> GetSubCategoriesAsync(int parentId)
        {
            var categories = await _categoryRepository.GetSubCategoriesAsync(parentId);
            var mapped = _mapper.Map<List<ResultCategoryDto>>(categories);
            return new SuccessDataResult<List<ResultCategoryDto>>(mapped);
        }

        [CacheAspect] // key, value
        public async Task<IDataResult<ResultCategoryWithSubDto>> GetWithSubCategoriesAsync(int id)
        {
            var category = await _categoryRepository.GetWithSubCategoriesAsync(id);
            if (category == null)
            {
                return new ErrorDataResult<ResultCategoryWithSubDto>(Messages.CategoryNotFound);
            }

            var mapped = _mapper.Map<ResultCategoryWithSubDto>(category);
            return new SuccessDataResult<ResultCategoryWithSubDto>(mapped);
        }

        [CacheAspect] // key, value
        public async Task<IDataResult<List<ResultCategoryHierarchyDto>>> GetCategoryHierarchyAsync()
        {
            var categories = await _categoryRepository.GetCategoryHierarchyAsync();
            var mapped = _mapper.Map<List<ResultCategoryHierarchyDto>>(categories);
            return new SuccessDataResult<List<ResultCategoryHierarchyDto>>(mapped);
        }

        [CacheRemoveAspect("ICategoryService.Get")]
        public async Task<IResult> CreateAsync(CreateCategoryDto dto)
        {
            if (await CheckIfCategoryNameExists(dto.Name))
            {
                return new ErrorResult(Messages.CategoryNameAlreadyExists);
            }

            if (await CheckIfCategoryLimitExceeded())
            {
                return new ErrorResult(Messages.CategoryLimitExceeded);
            }

            var category = _mapper.Map<Category>(dto);
            await _categoryRepository.AddAsync(category);
            return new SuccessResult(Messages.CategoryAdded);
        }

        [CacheRemoveAspect("ICategoryService.Get")]
        public async Task<IResult> UpdateAsync(UpdateCategoryDto dto)
        {
            var existing = await _categoryRepository.GetByIdAsync(dto.Id);
            if (existing == null)
            {
                return new ErrorResult(Messages.CategoryNotFound);
            }

            _mapper.Map(dto, existing);
            await _categoryRepository.UpdateAsync(existing);
            return new SuccessResult(Messages.CategoryUpdated);
        }

        [CacheRemoveAspect("ICategoryService.Get")]
        public async Task<IResult> DeleteAsync(int id)
        {
            var exists = await CheckIfCategoryExistsById(id);
            if (!exists)
            {
                return new ErrorResult(Messages.CategoryNotFound);
            }

            await _categoryRepository.DeleteAsync(id);
            return new SuccessResult(Messages.CategoryDeleted);
        }

        // İş Kuralları (Business Rules)

        // Aynı isimde kategori var mı?
        private async Task<bool> CheckIfCategoryNameExists(string name)
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.Any(c => c.Name.ToLower() == name.ToLower());
        }

        // Kategori sayısı belirli bir sınırı geçti mi?
        private async Task<bool> CheckIfCategoryLimitExceeded()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.Count() >= 20; // Örneğin maksimum 20 kategori
        }

        // Verilen ID'ye sahip kategori var mı?
        private async Task<bool> CheckIfCategoryExistsById(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            return category != null;
        }
    }
}