import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { encryptLocalPassword } from '../utils/localVault';

const SESSION_MS = 30 * 60 * 1000; // 30 min

export default function useAuth() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useCallback(async (rut, contrasena, rol) => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (rol === 'alumno') {
                data = await authService.loginAlumno(rut);
            } else {
                data = await authService.loginAdmin(rut, contrasena);
            }

            const usuario = data.alumno || data.admin;
            const token = data.token;

            // Guardar sesión
            localStorage.setItem('token', token);
            localStorage.setItem('usuario', JSON.stringify(usuario));
            localStorage.setItem('sessionExpiresAt', String(Date.now() + SESSION_MS));

            // Guardar contraseña cifrada (solo profesor/admin)
            if (rol !== 'alumno') {
                try {
                    const salt = usuario?._id || usuario?.correo || usuario?.rut || rut || 'anon';
                    const enc = await encryptLocalPassword(contrasena, salt);
                    if (enc) localStorage.setItem('password_enc', enc);
                } catch { }
                localStorage.removeItem('password');
                localStorage.removeItem('pwd');
                localStorage.removeItem('pass');
            } else {
                localStorage.removeItem('password_enc');
            }

            // Redirección
            if (rol === 'alumno') {
                navigate('/panel-alumno');
            } else {
                const tipo = usuario.rol;
                if (tipo === 'superadmin') navigate('/panel-admin');
                else if (tipo === 'profesor' || tipo === 'admin') navigate('/panel-profesor');
                else throw new Error('Rol no reconocido');
            }

            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.msg || err.message || 'Error al iniciar sesión';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const recuperarContrasena = useCallback(async (correo) => {
        setLoading(true);
        try {
            const data = await authService.recuperarContrasena(correo);
            return { success: true, message: data.msg || 'Correo enviado' };
        } catch (err) {
            const msg = err.response?.data?.msg || err.message || 'Error al enviar correo';
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const registroAlumno = useCallback(async (alumnoData) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Sesión expirada');

            await authService.registroAlumno(alumnoData, token);
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.msg || err.message || 'Error al registrar alumno';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        login,
        recuperarContrasena,
        registroAlumno,
        loading,
        error,
        setError
    };
}
