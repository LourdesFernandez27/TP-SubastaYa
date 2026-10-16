namespace Domain.Entities
{
    public class Usuario
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; }
        public DateTime FechaRegistro { get; set; }
        public string Name { get; set; } = string.Empty;
        public Billetera Billetera { get; set; } = null!;
        public List<Subasta> Subastas { get; set; }
        public List<Puja> Pujas { get; set; }
        public List<Auditoria_Log> Auditoria { get; set; }
    }
}
