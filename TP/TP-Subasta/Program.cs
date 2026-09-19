using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore; 
using Infraestructure.BackgroundServices;


var builder = WebApplication.CreateBuilder(args);

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

// Inyección y sembrado automático al iniciar la Web API
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    Seed.SeedDB(context);
}

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
