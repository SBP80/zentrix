import {
  getPersonal,
  addTrabajador,
  updateTrabajador,
  deleteTrabajador,
  getTrabajadorById
} from "./data/personal.js";

import {
  getAusencias,
  getAusenciasByTrabajador,
  addAusencia,
  updateAusencia,
  deleteAusencia
} from "./data/ausencias.js";

/*
  Capa única de acceso a datos.
  Hoy usa localStorage.
  Mañana podrá usar servidor sin tocar las vistas.
*/

export const db = {
  personal: {
    getAll() {
      return getPersonal();
    },

    getById(id) {
      return getTrabajadorById(id);
    },

    create(data) {
      return addTrabajador(data);
    },

    update(id, data) {
      return updateTrabajador(id, data);
    },

    remove(id) {
      return deleteTrabajador(id);
    }
  },

  ausencias: {
    getAll() {
      return getAusencias();
    },

    getByTrabajador(trabajadorId) {
      return getAusenciasByTrabajador(trabajadorId);
    },

    create(data) {
      return addAusencia(data);
    },

    update(id, data) {
      return updateAusencia(id, data);
    },

    remove(id) {
      return deleteAusencia(id);
    }
  }
};
