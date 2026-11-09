'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Atras } from '../layout/Atras';
import { Aviso } from '../ui/Aviso';
import { Button } from '../ui/Button';
import { IconShield } from '../ui/icons';
import { entrar, getUsuario } from '@/lib/auth';
import { useCategorias } from '@/lib/categorias';

// Registro de proveedor en celular, 2 pasos: 1) cuenta y negocio, 2) verificación de identidad (solo pantalla)
export function RegistroProveedorMovil() {
  const router = useRouter();
  const { categorias } = useCategorias();
  const [paso, setPaso] = useState(1);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [acepta, setAcepta] = useState(false);

  // Con un alta ya empezada, se sigue en "Perfil del negocio"
  useEffect(() => { if (getUsuario()?.rol === 'negocio') router.replace('/portal/perfil'); }, [router]);

  async function crear(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setError('');
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(d.password)) return setError('La contraseña debe tener 8 caracteres o más, una mayúscula y un número');
    if (!acepta) return setError('Debes aceptar los Términos y condiciones y el Aviso de privacidad');
    setCargando(true);
    try {
      await entrar('/auth/registro/proveedor', {
        nombre: d.nombre, apellidos: d.apellidos, email: d.email, password: d.password,
        negocio: { nombre: d.negocio, categoria: d.categoria, telefono: d.telefono, ciudad: d.ciudad, colonia: d.colonia },
        aceptaTerminos: true,
      });
      setPaso(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="screen screen--pagina">
      {paso === 1 ? <Atras href="/login/proveedores" /> : null}
      <p className="pantalla-nota">Paso {paso} de 2</p>
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}

      {paso === 1 ? (
        <form className="formulario" onSubmit={crear}>
          <h1 className="titulo">Crea tu cuenta de proveedor</h1>
          <label className="campo-etiqueta">Nombre<input name="nombre" required autoComplete="given-name" /></label>
          <label className="campo-etiqueta">Apellidos<input name="apellidos" required autoComplete="family-name" /></label>
          <label className="campo-etiqueta">Correo electrónico<input name="email" type="email" required autoComplete="email" /></label>
          <label className="campo-etiqueta">Contraseña<input name="password" type="password" required autoComplete="new-password" /><small>Al menos 8 caracteres, una mayúscula y un número</small></label>
          <label className="campo-etiqueta">Nombre del negocio<input name="negocio" required /></label>
          <label className="campo-etiqueta">Categoría
            <select name="categoria" required defaultValue="">
              <option value="" disabled>Elige una categoría</option>
              {categorias.map((c) => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
            </select>
          </label>
          <label className="campo-etiqueta">Teléfono del negocio<input name="telefono" type="tel" inputMode="tel" required /></label>
          <label className="campo-etiqueta">Ciudad<input name="ciudad" required /></label>
          <label className="campo-etiqueta">Colonia<input name="colonia" required /></label>
          <label className="ajuste">
            <span className="ajuste__texto"><small>Acepto los Términos y condiciones y el Aviso de privacidad</small></span>
            <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} aria-label="Acepto términos y privacidad" />
          </label>
          <Button className="btn--block" disabled={cargando}>{cargando ? 'Creando cuenta…' : 'Continuar'}</Button>
        </form>
      ) : (
        <div className="formulario">
          <h1 className="titulo">Verifica tu identidad</h1>
          <p className="subtitulo">Así los clientes sabrán que tu negocio es real.</p>
          {['Frente de tu identificación', 'Reverso de tu identificación'].map((t) => (
            <div key={t} className="subida-demo" aria-disabled>
              <IconShield /><strong>{t}</strong><small>Próximamente</small>
            </div>
          ))}
          <p className="nota-gris">La verificación de identidad todavía no está disponible: por ahora no se sube ni se guarda ningún documento. Puedes seguir y completar tu perfil.</p>
          <Button className="btn--block" onClick={() => router.push('/portal/perfil')}>Continuar</Button>
        </div>
      )}
    </main>
  );
}
