<<<<<<< HEAD
﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Options;
=======
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
>>>>>>> origin/Endpoints

namespace Infraestructure.Persistence
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
<<<<<<< HEAD

            optionsBuilder.UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=TP-Subasta;Trusted_Connection=True;");
=======
            optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=SubastaDb;Trusted_Connection=True;TrustServerCertificate=True;");
>>>>>>> origin/Endpoints

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
<<<<<<< HEAD
=======

>>>>>>> origin/Endpoints
