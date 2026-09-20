const API_BASE_URL = "https://localhost:7009/api";

export const apiService = {
  // GET /api/auctions/{id}
  obtenerSubastaPorId: async (subastaId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auctions/${subastaId}`);
      if (!response.ok) {
        throw new Error(`Error HTTP al obtener subasta: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Falló la consulta de detalle de subasta:", error);
      throw error;
    }
  },

  // POST /api/auctions/{id}/bids
  realizarPuja: async (subastaId, usuarioId, monto) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auctions/${subastaId}/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuarioId, monto }),
      });

      const data = await response.json();

      if (!response.ok) {

        return { success: false, status: response.status, mensaje: data.mensaje };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error de red al enviar la puja:", error);
      return { success: false, status: 500, mensaje: "No se pudo conectar con el servidor." };
    }
  },

  // GET /api/wallet/balance?usuarioId=X
  obtenerBalanceBilletera: async (usuarioId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/balance?usuarioId=${usuarioId}`);
      if (!response.ok) {
        throw new Error(`Error HTTP al obtener balance: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Falló la consulta de balance de la billetera:", error);
      throw error;
    }
  },

  // POST /api/wallet/deposit
  realizarDeposito: async (usuarioId, monto) => {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuarioId, monto }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, mensaje: data.mensaje };
      }
      return { success: true, data };
    } catch (error) {
      console.error("Falló la operación de depósito:", error);
      return { success: false, mensaje: "Error de red al realizar el depósito." };
    }
  }
};
