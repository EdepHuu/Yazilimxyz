using AutoMapper;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Category;
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

        public async Task<List<ResultCategoryDto>> GetAllAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return _mapper.Map<List<ResultCategoryDto>>(categories);
        }

        public async Task<ResultCategoryDto?> GetByIdAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            return _mapper.Map<ResultCategoryDto?>(category);
        }

        public async Task<List<ResultCategoryDto>> GetActiveAsync()
        {
            var categories = await _categoryRepository.GetActiveAsync();
            return _mapper.Map<List<ResultCategoryDto>>(categories);
        }

        public async Task<List<ResultCategoryDto>> GetParentCategoriesAsync()
        {
            var categories = await _categoryRepository.GetParentCategoriesAsync();
            return _mapper.Map<List<ResultCategoryDto>>(categories);
        }

        public async Task<List<ResultCategoryDto>> GetSubCategoriesAsync(int parentId)
        {
            var categories = await _categoryRepository.GetSubCategoriesAsync(parentId);
            return _mapper.Map<List<ResultCategoryDto>>(categories);
        }

        //public async Task<ResultCategoryWithSubDto?> GetWithSubCategoriesAsync(int id)
        //{
        //    var category = await _categoryRepository.GetWithSubCategoriesAsync(id);
        //    return _mapper.Map<ResultCategoryWithSubDto?>(category);
        //}

        //public async Task<List<ResultCategoryHierarchyDto>> GetCategoryHierarchyAsync()
        //{
        //    var categories = await _categoryRepository.GetCategoryHierarchyAsync();
        //    return _mapper.Map<List<ResultCategoryHierarchyDto>>(categories);
        //}

        public async Task CreateAsync(CreateCategoryDto dto)
        {
            var category = _mapper.Map<Category>(dto);
            await _categoryRepository.AddAsync(category);
        }

        public async Task UpdateAsync(UpdateCategoryDto dto)
        {
            var existingCategory = await _categoryRepository.GetByIdAsync(dto.Id);
            if (existingCategory != null)
            {
                _mapper.Map(dto, existingCategory);
                await _categoryRepository.UpdateAsync(existingCategory);
            }
        }

        public async Task DeleteAsync(int id)
        {
            await _categoryRepository.DeleteAsync(id);
        }
    }
}
