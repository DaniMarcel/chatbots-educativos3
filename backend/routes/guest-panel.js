const express = require('express');
const router = express.Router();
const { upload } = require('./upload-hero');
const GuestPanel = require('../models/GuestPanel');
const { verificarToken, autorizarRoles } = require('../middlewares/auth');

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

// PUT (update) guest panel configuration
router.put('/hero-blocks', verificarToken, autorizarRoles('superadmin'), upload.any(), async (req, res) => {
    const { body, files } = req;

    try {
        let panelConfig = await GuestPanel.findOne();
        if (!panelConfig) {
            panelConfig = new GuestPanel({ heroBlocks: [] });
        }

        const updatedHeroBlocks = [];
        for (let i = 0; ; i++) {
            const titleKey = `heroBlocks[${i}][title]`;
            if (!body[titleKey]) {
                break; 
            }

            const imageKey = `heroBlocks[${i}][image]`;
            const pdfKey = `heroBlocks[${i}][pdf]`;

            const imageFile = files.find(f => f.fieldname === imageKey);
            const pdfFile = files.find(f => f.fieldname === pdfKey);

            const existingBlock = panelConfig.heroBlocks[i];

            let image, pdf;

            if (imageFile) {
                image = imageFile.filename;
            } else if (body[imageKey] && body[imageKey] !== 'undefined' && body[imageKey] !== 'null') {
                image = body[imageKey];
            } else if (existingBlock) {
                image = existingBlock.image;
            }

            if (pdfFile) {
                pdf = pdfFile.filename;
            } else if (body[pdfKey] && body[pdfKey] !== 'undefined' && body[pdfKey] !== 'null') {
                pdf = body[pdfKey];
            } else if (existingBlock) {
                pdf = existingBlock.pdf;
            }

            updatedHeroBlocks.push({
                title: body[titleKey],
                image: image,
                pdf: pdf,
            });
        }

        panelConfig.heroBlocks = updatedHeroBlocks;

        await panelConfig.save();
        res.json(panelConfig);
    } catch (error) {
        console.error('Error updating guest panel config:', error);
        res.status(500).send('Error del servidor al actualizar la configuración del panel de visita.');
    }
});

module.exports = router;
