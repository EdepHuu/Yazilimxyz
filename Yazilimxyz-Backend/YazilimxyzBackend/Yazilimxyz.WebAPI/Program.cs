using Microsoft.EntityFrameworkCore;
using Yazilimxyz.DataAccessLayer.Context;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Connection string'i al
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// DbContext servisini kaydet
builder.Services.AddDbContext<AppDbContext>(options =>
	options.UseSqlServer(connectionString,
		b => b.MigrationsAssembly("Yazilimxyz.DataAccessLayer")));
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
