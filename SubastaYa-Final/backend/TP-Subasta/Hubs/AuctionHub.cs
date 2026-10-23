using Microsoft.AspNetCore.SignalR;

namespace TP_Subasta.Hubs
{
    public class AuctionHub : Hub
    {
        public async Task UnirseASubasta(string subastaId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId,subastaId);
        }

        public async Task SalirDeSubasta(string subastaId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId,subastaId);
        }
    }
}
    

