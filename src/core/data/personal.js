export const usuarios = [
  {
    usuario: "sergio",
    password: "1234",
    nombre: "Sergio",
    rol: "admin"
  },
  {
    usuario: "operario",
    password: "1234",
    nombre: "Operario",
    rol: "user"
  }
];

export function validarUsuario(user, pass) {
  return usuarios.find(
    u => u.usuario === user && u.password === pass
  );
}