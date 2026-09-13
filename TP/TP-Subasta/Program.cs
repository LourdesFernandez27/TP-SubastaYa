using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;
<<<<<<< HEAD
using Infraestructure.BackgroundServices;

var builder = WebApplication.CreateBuilder(args);

=======

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

>>>>>>> origin/Endpoints
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
<<<<<<< HEAD
builder.Services.AddHostedService<SubastaWorker>();

//custom
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(option => option.UseSqlServer(connectionString));
=======

// Custom
/* LO AGREGÓ LA IA
 * var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=(localdb)\\mssqllocaldb;Database=SubastaDb;Trusted_Connection=True;TrustServerCertificate=True;";
builder.Services.AddDbContext<AppDbContext>(option => option.UseSqlServer(connectionString));
*/
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlServer(connectionString));
>>>>>>> origin/Endpoints


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
