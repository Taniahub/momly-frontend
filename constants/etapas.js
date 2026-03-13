export const getEtapaBebe = (fechaNacimiento) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  const meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 
                + (hoy.getMonth() - nacimiento.getMonth());

  if (meses <= 3)  return { etapa: 'Recién nacido',  rango: '0-3 meses',   emoji: '🌱' };
  if (meses <= 6)  return { etapa: 'Bebé temprano',  rango: '4-6 meses',   emoji: '🌸' };
  if (meses <= 12) return { etapa: 'Bebé activo',    rango: '7-12 meses',  emoji: '🌟' };
  if (meses <= 24) return { etapa: 'Caminador',      rango: '13-24 meses', emoji: '👣' };
  return             { etapa: 'Explorador',           rango: '25-36 meses', emoji: '🚀' };
};