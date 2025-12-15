const API_URL = "http://localhost:3003/api/services";

export const servicesApi = {
  // Obtener todos los servicios
  getAllServices: async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error al obtener servicios");
      return await response.json();
    } catch (error) {
      console.error("Error en getAllServices:", error);
      throw error;
    }
  },

  // Buscar servicios con filtros
  searchServices: async (ciudad, categoria) => {
    try {
      const params = new URLSearchParams();
      if (ciudad) params.append("ciudad", ciudad);
      if (categoria) params.append("categoria", categoria);

      const response = await fetch(`${API_URL}/search?${params.toString()}`);
      if (!response.ok) throw new Error("Error al buscar servicios");
      return await response.json();
    } catch (error) {
      console.error("Error en searchServices:", error);
      throw error;
    }
  },

  // Obtener un servicio por ID
  getServiceById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error("Servicio no encontrado");
      return await response.json();
    } catch (error) {
      console.error("Error en getServiceById:", error);
      throw error;
    }
  },

  // Crear un nuevo servicio
  addService: async (serviceData) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      });
      if (!response.ok) throw new Error("Error al crear servicio");
      return await response.json();
    } catch (error) {
      console.error("Error en addService:", error);
      throw error;
    }
  },

  // Actualizar un servicio
  updateService: async (id, serviceData) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      });
      if (!response.ok) throw new Error("Error al actualizar servicio");
      return await response.json();
    } catch (error) {
      console.error("Error en updateService:", error);
      throw error;
    }
  },

  // Eliminar un servicio
  deleteService: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar servicio");
      return await response.json();
    } catch (error) {
      console.error("Error en deleteService:", error);
      throw error;
    }
  },
};
