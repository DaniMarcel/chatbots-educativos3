const express = require('express');
const router = express.Router();
 
const GuestPanel = require('../models/GuestPanel');
const { verificarToken, autorizarRoles } = require('../middlewares/auth');
const mongoose = require('mongoose');

// GET guest panel configuration
router.get('/', async (req, res) => {
    try {
        let panelConfig = await GuestPanel.findOne();
        if (!panelConfig) {
            panelConfig = new GuestPanel({
                welcome: {
                    title: 'Bienvenido a la Plataforma',
                    text: 'Explora los recursos que hemos preparado para ti.'
                },
                chatbots: [],
                videos: [],
                heroBlocks: [
                    {
                        title: 'Cursos Cortos',
                        image: 'B1.png',
                        pdf: '#'
                    },
                    {
                        title: 'Matriculas Abiertas 2026',
                        image: 'B2.png',
                        pdf: '#'
                    },
                    {
                        title: 'Información Adicional',
                        image: 'B3.png',
                        pdf: '#'
                    }
                ]
            });
            await panelConfig.save();
        } else if (!panelConfig.heroBlocks || panelConfig.heroBlocks.length === 0) {
            panelConfig.heroBlocks = [
                {
                    title: 'Cursos Cortos',
                    image: 'B1.png',
                    pdf: '#'
                },
                {
                    title: 'Matriculas Abiertas 2026',
                    image: 'B2.png',
                    pdf: '#'
                },
                {
                    title: 'Información Adicional',
                    image: 'B3.png',
                    pdf: '#'
                }
            ];
            await panelConfig.save();
        }
        res.json(panelConfig);
    } catch (error) {
        console.error('Error fetching guest panel config:', error);
        res.status(500).send('Error del servidor al obtener la configuración del panel de visita.');
    }
});

module.exports = router;
