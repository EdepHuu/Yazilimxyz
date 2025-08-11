using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.Concrete;
using Yazilimxyz.BusinessLayer.Mapping;
using Yazilimxyz.CoreLayer.Storage;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.DataAccessLayer.Concrete;
using Yazilimxyz.DataAccessLayer.Context;
using Yazilimxyz.EntityLayer.Entities;
using Yazilimxyz.InfrastructureLayer.Security;
using Yazilimxyz.InfrastructureLayer.Storage;

var builder = WebApplication.CreateBuilder(args);

// ---------- DbContext ----------
builder.Services.AddDbContext<AppDbContext>(options =>
	options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
		b => b.MigrationsAssembly("Yazilimxyz.DataAccessLayer")));

// ---------- Identity ----------
builder.Services.AddIdentity<AppUser, IdentityRole>()
	.AddEntityFrameworkStores<AppDbContext>()
	.AddDefaultTokenProviders();

builder.Services.AddHttpContextAccessor();

// ---------- JWT ----------
var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
	options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
	options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
	options.TokenValidationParameters = new TokenValidationParameters
	{
		ValidateIssuer = true,
		ValidateAudience = true,
		ValidateLifetime = true,
		ValidateIssuerSigningKey = true,
		ValidIssuer = jwtIssuer,
		ValidAudience = jwtAudience,
		IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
	};
});

// ---------- Authorization ----------
builder.Services.AddAuthorization(opts =>
{
	// "IsAdmin" claim'i true olmalý
	opts.AddPolicy("Admin", policy => policy.RequireClaim("IsAdmin", "true"));
});

// ---------- CORS ----------
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAll", policy =>
		policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// ---------- Upload limit (ör. 20 MB) ----------
builder.Services.Configure<FormOptions>(o =>
{
	o.MultipartBodyLengthLimit = 20_000_000;
});

// ---------- DI: Services ----------
builder.Services.AddScoped<IProductService, ProductManager>();
builder.Services.AddScoped<ICategoryService, CategoryManager>();
builder.Services.AddScoped<IOrderService, OrderManager>();
builder.Services.AddScoped<IOrderItemService, OrderItemManager>();
builder.Services.AddScoped<IProductVariantService, ProductVariantManager>();
builder.Services.AddScoped<IProductImageService, ProductImageManager>();
builder.Services.AddScoped<ISupportMessageService, SupportMessageManager>();
builder.Services.AddScoped<IAuthService, AuthManager>();
builder.Services.AddScoped<IAppUserService, AppUserManager>();
builder.Services.AddScoped<IMerchantService, MerchantManager>();
builder.Services.AddScoped<ICustomerService, CustomerManager>();
builder.Services.AddScoped<ICustomerAddressService, CustomerAddressManager>();

// ---------- DI: Repositories ----------
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderItemRepository, OrderItemRepository>();
builder.Services.AddScoped<IProductVariantRepository, ProductVariantRepository>();
builder.Services.AddScoped<IProductImageRepository, ProductImageRepository>();
builder.Services.AddScoped<ISupportMessageRepository, SupportMessageRepository>();
builder.Services.AddScoped<IAppUserRepository, AppUserRepository>();
builder.Services.AddScoped<IMerchantRepository, MerchantRepository>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<ICustomerAddressRepository, CustomerAddressRepository>();
builder.Services.AddScoped<ICartItemRepository, CartItemRepository>();

// ---------- DI: Token & Storage ----------
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<IFileStorage, LocalFileStorage>();

// ---------- MVC & Swagger ----------
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
	c.SwaggerDoc("v1", new OpenApiInfo { Title = "Yazilimxyz.WebAPI", Version = "v1" });
	c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
	{
		Name = "Authorization",
		Type = SecuritySchemeType.ApiKey,
		Scheme = "Bearer",
		BearerFormat = "JWT",
		In = ParameterLocation.Header,
		Description = "JWT Token'ý 'Bearer {token}' formatýnda giriniz."
	});
	c.AddSecurityRequirement(new OpenApiSecurityRequirement
	{
		{
			new OpenApiSecurityScheme
			{
				Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
			},
			Array.Empty<string>()
		}
	});
});

var app = builder.Build();

// ---------- Middleware Sýrasý ----------
if (app.Environment.IsDevelopment())
{
	app.UseDeveloperExceptionPage();
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ---------- Seed Admin ----------
using (var scope = app.Services.CreateScope())
{
	await SeedAdminAsync(scope.ServiceProvider, builder.Configuration);
}

app.Run();

// ================== SEED ADMIN ==================
static async Task SeedAdminAsync(IServiceProvider sp, IConfiguration cfg)
{
	var userMgr = sp.GetRequiredService<UserManager<AppUser>>();
	var email = cfg["Admin:Email"] ?? "admin@yazilimxyz.com";
	var pass = cfg["Admin:Password"] ?? "Admin_123!";
	var name = cfg["Admin:Name"] ?? "System";
	var last = cfg["Admin:LastName"] ?? "Admin";

	var admin = await userMgr.FindByEmailAsync(email);
	if (admin == null)
	{
		admin = new AppUser
		{
			UserName = email,
			Email = email,
			Name = name,
			LastName = last,
			IsAdmin = true,
			EmailConfirmed = true,
			CreatedAt = DateTime.UtcNow
		};

		var create = await userMgr.CreateAsync(admin, pass);
		if (!create.Succeeded)
		{
			var msg = string.Join(", ", create.Errors.Select(e => e.Description));
			throw new Exception("Admin seed baþarýsýz: " + msg);
		}
	}
	else if (!admin.IsAdmin)
	{
		admin.IsAdmin = true;
		await userMgr.UpdateAsync(admin);
	}
}
