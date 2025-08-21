using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.Constans;
using Yazilimxyz.BusinessLayer.DTOs.Category;

namespace Yazilimxyz.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
	public class CategoryController : ControllerBase
	{
		private readonly ICategoryService _categoryService;

		public CategoryController(ICategoryService categoryService)
		{
			_categoryService = categoryService;
		}

		// GET: api/Category
		[HttpGet]
		public async Task<IActionResult> GetAll()
		{
			var categories = await _categoryService.GetAllWithRelationsAsync();
			return Ok(categories);
		}

		// GET: api/Category/5
		[HttpGet("{id}")]
		public async Task<IActionResult> GetById(int id)
		{
			var category = await _categoryService.GetByIdAsync(id);

			if (category == null)
			{
				return NotFound();
			}

			return Ok(category);
		}

		// POST: api/Category
		[HttpPost]
		[Authorize(Roles = "AppAdmin")]
		public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			await _categoryService.CreateAsync(dto);
			return Ok(new { message = Messages.CategoryAdded });
		}

		// PUT: api/Category
		[HttpPut]
		[Authorize(Roles = "AppAdmin")]
		public async Task<IActionResult> Update([FromBody] UpdateCategoryDto dto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			await _categoryService.UpdateAsync(dto);
			return Ok(new { message = Messages.CategoryUpdated });
		}

		// DELETE: api/Category/5
		[HttpDelete("{id}")]
		[Authorize(Roles = "AppAdmin")]
		public async Task<IActionResult> Delete(int id)
		{
			await _categoryService.DeleteAsync(id);
			return Ok(new { message = Messages.CategoryDeleted });
		}

		// GET: api/Category/active
		[HttpGet("active")]
		public async Task<IActionResult> GetActive()
		{
			var categories = await _categoryService.GetActiveAsync();
			return Ok(categories);
		}

		// GET: api/Category/hierarchy
		[HttpGet("hierarchy")]
		public async Task<IActionResult> GetCategoryHierarchy()
		{
			var categories = await _categoryService.GetCategoryHierarchyAsync();
			return Ok(categories);
		}

		// GET: api/Category/parents
		[HttpGet("parents")]
		public async Task<IActionResult> GetParentCategories()
		{
			var categories = await _categoryService.GetParentCategoriesAsync();
			return Ok(categories);
		}

		// GET: api/Category/subcategories/{parentId}
		[HttpGet("subcategories/{parentId}")]
		public async Task<IActionResult> GetSubCategories(int parentId)
		{
			var categories = await _categoryService.GetSubCategoriesAsync(parentId);
			return Ok(categories);
		}

		// GET: api/Category/withsubcategories/{id}
		[HttpGet("withsubcategories/{id}")]
		public async Task<IActionResult> GetWithSubCategories(int id)
		{
			var category = await _categoryService.GetWithSubCategoriesAsync(id);

			if (category == null)
			{
				return NotFound();
			}

			return Ok(category);
		}
	}
}
