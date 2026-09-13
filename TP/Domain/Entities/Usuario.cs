namespace Domain.Entities
{
    public class Usuario
    {
        public int Id { get; set; }
<<<<<<< HEAD
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Billetera Billetera { get; set; }

=======
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public DateTime FechaRegistro { get; set; }
        public Billetera Billetera { get; set; }
        public ICollection<Subasta> Subastas { get; set; }
        public ICollection<Puja> Pujas { get; set; }
        public ICollection<Auditoria_Log> Auditoria { get; set; }
>>>>>>> origin/Endpoints
    }
}
