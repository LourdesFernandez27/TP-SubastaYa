using Application.DTOs;
using Application.UseCases;
using Domain.Entities;
using Domain.Exceptions;
using Infraestructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Domain.Enums;

namespace TP_Subasta.Controllers
{
    [ApiController]
    [Route("api/auctions")]
    public class AuctionsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PujarUseCase _pujarUseCase;

        public AuctionsController(AppDbContext context, PujarUseCase pujarUseCase)
        {
            _context = context;
            _pujarUseCase = pujarUseCase;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] EstadoSubasta? estado, [FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 20;

            var query = _context.Subastas
                .Include(s => s.Pujas)
                .AsNoTracking();

            if (estado.HasValue)
            {
                query = query.Where(s => s.Estado == estado.Value);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                query = query.Where(s => s.Titulo.Contains(q) || s.Descripcion.Contains(q));
            }

            var totalItems = await query.CountAsync();

            var list = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                Items = list
            });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var subasta = await _context.Subastas
                .Include(s => s.Pujas)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subasta == null)
            {
                return NotFound(new { mensaje = $"La subasta con ID {id} no existe" });
            }

            return Ok(subasta);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CrearSubastaRequest request)
        {
            if (request.FechaFin <= request.FechaInicio)
            {
                return BadRequest(new { mensaje = "La fecha de finalización debe ser posterior a la de inicio" });
            }
            if (request.PrecioBase <= 0 || request.IncrementoMinimo <= 0)
            {
                return BadRequest(new { mensaje = "El precio base y el incremento mínimo deben ser positivos" });
            }

            var subasta = new Subasta
            {
                Titulo = request.Titulo,
                Descripcion = request.Descripcion,
                UrlImagen = request.UrlImagen,
                PrecioBase = request.PrecioBase,
                IncrementoMinimo = request.IncrementoMinimo,
                FechaFin = request.FechaFin,
                VendedorId = request.VendedorId,
                Estado = DateTime.UtcNow >= request.FechaInicio ? EstadoSubasta.ACTIVA : EstadoSubasta.PROGRAMADA
            };

            await _context.Subastas.AddAsync(subasta);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = subasta.Id }, subasta);
        }

        [HttpPost("{id:int}/bids")]
        public async Task<IActionResult> Pujar(int id, [FromBody] PujarRequest request)
        {
            try
            {
                await _pujarUseCase.EjecutarAsync(new PujarRequest(id, request.UsuarioId, request.Monto));
                return Ok(new { mensaje = "Puja registrada" });
            }
            catch (NegocioException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (ConcurrenciaException ex)
            {
                return StatusCode(409, new { mensaje = ex.Message });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno", detalle = ex.Message });
            }
        }
    }
}

