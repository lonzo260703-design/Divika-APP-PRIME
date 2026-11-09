'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { FotosNegocio } from '@/components/portal/FotosNegocio';
import { PerfilForm } from '@/components/portal/PerfilForm';
import { iniciales } from '@/components/portal/PortalContext';
import { IconCheck, IconScissors, IconShield, IconStore, IconUser } from '@/components/ui/icons';
import { api } from '@/lib/api';
import { cerrarSesion, entrar, getUsuario } from '@/lib/auth';
import { useCategorias } from '@/lib/categorias';
import { useEscritorio } from '@/lib/useEscritorio';
import { RegistroProveedorMovil } from '@/components/portal/RegistroProveedorMovil';
import { cx } from '@/lib/cx';
import type { Negocio } from '@/types';

const PASOS = [
  { nombre: 'Cuenta', menu: 'Crea tu cuenta', icono: <IconUser /> },
  { nombre: 'Negocio', menu: 'Completa tu negocio', icono: <IconStore /> },
  { nombre: 'Servicios', menu: 'Agrega tus servicios', icono: <IconScissors /> },
  { nombre: 'Publicación', menu: 'Publica tu perfil', icono: <IconCheck /> },
];

const TITULOS = [
  ['Crea tu cuenta de proveedor', 'Empecemos por tus datos. Podrás completar y publicar tu perfil después.'],
  ['Completa tu negocio', 'Cuenta qué ofreces y muestra tu trabajo. Podrás cambiarlo cuando quieras.'],
  ['Agrega tus servicios', 'Define qué ofreces, a qué precio y cuánto dura cada servicio.'],
  ['Revisa y publica', 'Confirma que tu perfil esté listo para que los clientes te encuentren.'],
];

// Registro de proveedor en 4 pasos (diseño web "Crea tu cuenta de proveedor")
function RegistroProveedorWeb() {
  const router = useRouter();
  const { categorias } = useCategorias();
  const [paso, setPaso] = useState(0);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [listo, setListo] = useState(false);
  const [nombreAlta, setNombreAlta] = useState('');

  // Si ya hay un alta empezada con sesión, retoma desde el paso 2
  useEffect(() => {
    const u = getUsuario();
    if (u?.rol !== 'negocio') return setListo(true);
    api<Negocio>('/proveedor/negocio')
      .then((n) => {
        if (n.estado === 'publicado') return router.replace('/portal');
        setNegocio(n);
        setPaso(1);
      })
      .catch(() => cerrarSesion())
      .finally(() => setListo(true));
  }, [router]);

  if (!listo) return null;
  const [titulo, sub] = TITULOS[paso];

  return (
    <div className="web-pagina">
      <div className="portal">
        <aside className="p-lateral p-lateral--pasos">
          <Link href="/" className="p-logo" aria-label="Divika, inicio"><img src="/logo.png" alt="Divika" /></Link>
          {negocio && (
            <div className="p-negocio">
              <span className="p-avatar">{iniciales(negocio.nombre)}</span>
              <div><strong>{negocio.nombre}</strong><small>{[negocio.colonia, negocio.ciudad].filter(Boolean).join(' · ')}</small></div>
              <span className="p-estado p-estado--en_proceso">Alta en proceso</span>
            </div>
          )}
          <ol className="p-pasos-menu">
            {PASOS.map((p, i) => (
              <li key={p.menu} className={cx(i === paso && 'activo', i < paso && 'hecho')}>
                <span>{i < paso ? <IconCheck /> : i + 1}</span> {p.menu}
              </li>
            ))}
          </ol>
        </aside>

        <div className="p-principal">
          <header className="p-barra-sup">
            <span className="p-barra-sup__titulo">Portal de proveedores</span>
            <span className="p-barra-sup__enlace">¿Ya tienes una cuenta?</span>
            <Link href="/login/proveedores" className="p-btn p-btn--borde">Iniciar sesión</Link>
          </header>

          <main className="p-contenido">
            <div className="p-encabezado">
              <div><h1 className="p-titulo">{titulo}</h1><p className="p-sub">{sub}</p></div>
              <span className="p-paso-chip">Paso {paso + 1} de 4</span>
            </div>
            <div className="p-progreso" aria-hidden>
              {PASOS.map((p, i) => <div key={p.nombre} className={cx(i <= paso && 'lleno')}><span>{i + 1}. {p.nombre}</span></div>)}
            </div>

            {paso === 0 && (
              <PasoCuenta
                categorias={categorias}
                onCreada={(n) => { setNegocio(n); setNombreAlta(n.nombre); setPaso(1); }}
              />
            )}

            {paso === 1 && negocio && (
              <div className="p-columnas">
                <div className="p-columna">
                  <section className="p-tarjeta">
                    <h2>Sobre tu negocio</h2>
                    <PerfilForm negocio={negocio} modo="basico" onGuardado={setNegocio} etiquetaGuardar="Guardar" alCancelar={false} />
                  </section>
                  <section className="p-tarjeta">
                    <h2>Fotos del negocio</h2>
                    <p className="p-sub">Sube al menos una foto; será tu portada.</p>
                    <FotosNegocio negocio={negocio} onCambio={setNegocio} />
                  </section>
                  <div className="p-acciones">
                    <button type="button" className="p-btn" onClick={() => setPaso(2)}>Continuar</button>
                  </div>
                </div>
                <Lateral nombre={negocio.nombre || nombreAlta} />
              </div>
            )}

            {paso === 2 && negocio && (
              <div className="p-columnas">
                <div className="p-columna">
                  <section className="p-tarjeta p-aviso-grande">
                    <h2>Tus servicios</h2>
                    <p>Podrás crear tus servicios, con precio, duración y fotos, desde <strong>Mis servicios</strong> en tu portal. Esta sección estará disponible muy pronto.</p>
                  </section>
                  <div className="p-acciones">
                    <button type="button" className="p-btn p-btn--borde" onClick={() => setPaso(1)}>Atrás</button>
                    <button type="button" className="p-btn" onClick={() => setPaso(3)}>Continuar</button>
                  </div>
                </div>
                <Lateral nombre={negocio.nombre} />
              </div>
            )}

            {paso === 3 && negocio && <PasoPublicar negocio={negocio} onAtras={() => setPaso(2)} onPublicar={(n) => { setNegocio(n); router.push('/portal/perfil'); }} onDespues={() => router.push('/portal')} />}
          </main>
        </div>
      </div>
    </div>
  );
}

function Lateral({ nombre }: { nombre: string }) {
  return (
    <div className="p-columna p-columna--lateral">
      <section className="p-tarjeta">
        <h2>Tu alta, paso a paso</h2>
        <ul className="p-lista">
          <li><IconUser /><div><strong>Crea tu cuenta</strong><small>Protege el acceso a tu negocio.</small></div></li>
          <li><IconStore /><div><strong>Completa tu perfil</strong><small>Agrega fotos y descripción de {nombre || 'tu negocio'}.</small></div></li>
          <li><IconScissors /><div><strong>Ofrece tus servicios</strong><small>Define precios, pagos y disponibilidad.</small></div></li>
          <li><IconCheck /><div><strong>Revisa y publica</strong><small>Tú decides cuándo será visible.</small></div></li>
        </ul>
      </section>
      <section className="p-tarjeta p-nota"><IconShield /><div><strong>Trato directo, sin comisión</strong><small>Divika conecta tu negocio con personas de tu zona. Acuerdas el servicio y el pago directamente con cada cliente.</small></div></section>
    </div>
  );
}

function PasoCuenta({ categorias, onCreada }: { categorias: { slug: string; nombre: string }[]; onCreada: (n: Negocio) => void }) {
  const [pass, setPass] = useState('');
  const [confirma, setConfirma] = useState('');
  const [ver, setVer] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const reglas = [
    ['8 caracteres o más', pass.length >= 8],
    ['Una mayúscula', /[A-Z]/.test(pass)],
    ['Un número', /\d/.test(pass)],
  ] as const;

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setError('');
    if (!reglas.every(([, ok]) => ok)) return setError('La contraseña debe tener 8 caracteres o más, una mayúscula y un número');
    if (pass !== confirma) return setError('Las contraseñas no coinciden');
    if (!acepta) return setError('Debes aceptar los Términos y condiciones y el Aviso de privacidad');
    setCargando(true);
    try {
      await entrar('/auth/registro/proveedor', {
        nombre: d.nombre, apellidos: d.apellidos, email: d.email, password: pass,
        negocio: { nombre: d.negocio, categoria: d.categoria, telefono: d.telefono, ciudad: d.ciudad, colonia: d.colonia },
        aceptaTerminos: true, recibirNovedades: d.novedades === 'on',
      });
      onCreada(await api<Negocio>('/proveedor/negocio'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="p-columnas">
      <form className="p-columna" onSubmit={enviar}>
        <section className="p-tarjeta">
          <h2>Datos de acceso</h2>
          <p className="p-sub">Usa un correo al que tengas acceso para administrar tu negocio.</p>
          <div className="p-form">
            <label className="p-campo">Nombre *<input name="nombre" required autoComplete="given-name" /></label>
            <label className="p-campo">Apellidos *<input name="apellidos" required autoComplete="family-name" /></label>
            <label className="p-campo p-campo--ancho">Correo electrónico *<input name="email" type="email" required autoComplete="email" /><small>Aquí recibirás el enlace para verificar tu cuenta.</small></label>
            <label className="p-campo">Contraseña *<input type={ver ? 'text' : 'password'} value={pass} onChange={(e) => setPass(e.target.value)} required autoComplete="new-password" /></label>
            <label className="p-campo">Confirmar contraseña *<input type={ver ? 'text' : 'password'} value={confirma} onChange={(e) => setConfirma(e.target.value)} required autoComplete="new-password" /></label>
            <div className="p-reglas p-campo--ancho">
              {reglas.map(([t, ok]) => <span key={t} className={cx(ok && 'ok')}>{ok ? '✓' : '○'} {t}</span>)}
              <button type="button" className="p-enlace" onClick={() => setVer((v) => !v)}>{ver ? 'Ocultar' : 'Mostrar'} contraseñas</button>
            </div>
          </div>

          <h2 className="p-subtitulo">Tu negocio</h2>
          <div className="p-form">
            <label className="p-campo p-campo--ancho">Nombre del negocio *<input name="negocio" required /></label>
            <label className="p-campo">Categoría principal *
              <select name="categoria" required defaultValue="">
                <option value="" disabled>Elige una categoría</option>
                {categorias.map((c) => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
              </select>
            </label>
            <label className="p-campo">Teléfono / WhatsApp *<input name="telefono" required inputMode="tel" placeholder="618 123 4567" /></label>
            <label className="p-campo">Ciudad *<input name="ciudad" required autoComplete="address-level2" /></label>
            <label className="p-campo">Colonia *<input name="colonia" required /></label>
          </div>

          <label className="p-check"><input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} /> Acepto los Términos y condiciones y el Aviso de privacidad de Divika. *</label>
          <label className="p-check"><input type="checkbox" name="novedades" /> Quiero recibir consejos y novedades para mi negocio.</label>

          {error && <p className="form__error" role="alert">{error}</p>}
          <div className="p-barra p-barra--simple">
            <small>* Campos obligatorios</small>
            <button type="submit" className="p-btn" disabled={cargando}>{cargando ? 'Creando…' : 'Crear cuenta y continuar →'}</button>
          </div>
        </section>
      </form>
      <Lateral nombre="" />
    </div>
  );
}

function PasoPublicar({ negocio, onAtras, onPublicar, onDespues }: { negocio: Negocio; onAtras: () => void; onPublicar: (n: Negocio) => void; onDespues: () => void }) {
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const lista = [
    ['Nombre del negocio', !!negocio.nombre?.trim()],
    ['Descripción', !!negocio.descripcion?.trim()],
    ['Teléfono de contacto', !!negocio.telefono?.trim()],
    ['Al menos una foto', !!negocio.galeria?.length],
  ] as const;
  async function publicar() {
    setError('');
    setCargando(true);
    try {
      onPublicar(await api<Negocio>('/proveedor/negocio/publicar', { method: 'POST' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo publicar');
    } finally {
      setCargando(false);
    }
  }
  return (
    <div className="p-columnas">
      <div className="p-columna">
        <section className="p-tarjeta">
          <h2>Antes de publicar</h2>
          <ul className="p-checklist">
            {lista.map(([t, ok]) => <li key={t} className={cx(ok && 'ok')}><span>{ok ? '✓' : '○'}</span> {t}</li>)}
          </ul>
          <p className="p-sub">Tú decides cuándo será visible. Podrás pausar tu perfil en cualquier momento.</p>
          {error && <p className="form__error" role="alert">{error}</p>}
        </section>
        <div className="p-acciones">
          <button type="button" className="p-btn p-btn--borde" onClick={onAtras}>Atrás</button>
          <button type="button" className="p-btn p-btn--borde" onClick={onDespues}>Publicar después</button>
          <button type="button" className="p-btn" disabled={cargando} onClick={publicar}>{cargando ? 'Publicando…' : 'Publicar mi negocio'}</button>
        </div>
      </div>
      <Lateral nombre={negocio.nombre} />
    </div>
  );
}

export default function RegistroProveedor() {
  const escritorio = useEscritorio();
  if (escritorio === null) return null;
  return escritorio ? <RegistroProveedorWeb /> : <RegistroProveedorMovil />;
}
