using Infraestructure.BackgroundServices;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore; 
using Microsoft.Extensions.Options;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("https://localhost:5173")
              .AllowAnyHeader() 
              .AllowAnyMethod(); 
    }); 
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHostedService<SubastaWorker>();

//custom
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(option => option.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString), b => b.MigrationsAssembly("Infraestructure")));
builder.Services.AddScoped<Application.Interfaces.IUnitOfWork, Infraestructure.Persistence.Repositories.UnitOfWork>();
builder.Services.AddScoped<Application.Interfaces.ISubastaRepository, Infraestructure.Persistence.Repositories.SubastaRepository>();
builder.Services.AddScoped<Application.Interfaces.IBilleteraRepository, Infraestructure.Persistence.Repositories.BilleteraRepository>();

builder.Services.AddScoped<Application.UseCases.PujarUseCase>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    Seed.SeedDB(context);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
