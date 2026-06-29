// Graine numérique stable à partir d'un id. Les ids sont des UUID (chaînes) :
// les passer directement à Math.* ou à un modulo donnerait NaN (couleurs d'avatar
// uniformes, coordonnées de carte invalides, etc.). On hashe la chaîne en un
// entier positif déterministe.
export const idSeed = (id) => {
  if (typeof id === 'number' && Number.isFinite(id)) return Math.abs(id);
  const s = String(id ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) % 1000000007;
  }
  return Math.abs(h);
};

export default idSeed;
