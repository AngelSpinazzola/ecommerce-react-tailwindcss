export const SUBCATEGORY_RULES = {
    'almacenamiento': {
        name: 'Almacenamiento',
        types: {
            SSD: {
                id: 'ssd',
                name: 'SSD',
                keywords: ['ssd', 'nvme', 'm.2', 'm2', 'sata'],
                priority: 1
            },
            HDD: {
                id: 'hdd',
                name: 'HDD',
                keywords: ['hdd', 'rpm', 'mecanico'],
                priority: 2
            }
        }
    },

    'placas de video': {
        name: 'Placas de Video',
        types: {
            NVIDIA: {
                id: 'nvidia',
                name: 'NVIDIA',
                keywords: ['nvidia', 'geforce', 'rtx', 'gtx'],
                priority: 1
            },
            AMD: {
                id: 'amd-gpu',
                name: 'AMD',
                keywords: ['amd', 'radeon', 'rx'],
                priority: 2
            }
        }
    },

    'refrigeracion': {
        name: 'Refrigeración',
        types: {
            AIR: {
                id: 'aire',
                name: 'Por Aire',
                keywords: ['aire', 'fan', 'tower', 'cooler', 'disipador'],
                priority: 1
            },
            LIQUID: {
                id: 'liquida',
                name: 'Líquida',
                keywords: ['liquida', 'aio', 'watercooling', 'liquid', 'refrigeracion liquida'],
                priority: 2
            }
        }
    },

    'procesadores': {
        name: 'Procesadores',
        types: {
            INTEL: {
                id: 'intel-cpu',
                name: 'Intel',
                keywords: ['intel', 'core i', 'i3', 'i5', 'i7', 'i9'],
                priority: 1
            },
            AMD_CPU: {
                id: 'amd-cpu',
                name: 'AMD',
                keywords: ['amd', 'ryzen', 'threadripper'],
                priority: 2
            }
        }
    },

    'motherboards': {
        name: 'Motherboards',
        types: {
            INTEL_LGA1700: {
                id: 'lga1700',
                name: 'Intel LGA 1700',
                keywords: ['lga1700', 'lga 1700', '1700', 'z790', 'b760', 'h770'],
                priority: 1
            },
            INTEL_LGA1200: {
                id: 'lga1200',
                name: 'Intel LGA 1200',
                keywords: ['lga1200', 'lga 1200', '1200', 'z590', 'b560', 'h510'],
                priority: 2
            },
            AMD_AM5: {
                id: 'am5',
                name: 'AMD AM5',
                keywords: ['am5', 'socket am5', 'x670', 'b650', 'a620'],
                priority: 3
            },
            AMD_AM4: {
                id: 'am4',
                name: 'AMD AM4',
                keywords: ['am4', 'socket am4', 'x570', 'b550', 'a520', 'b450'],
                priority: 4
            }
        }
    },

    'fuentes': {
        name: 'Fuentes de Poder',
        types: {
            MODULAR: {
                id: 'modular',
                name: 'Modular',
                keywords: ['modular', 'fully modular', 'completamente modular'],
                priority: 1
            },
            SEMI_MODULAR: {
                id: 'semi-modular',
                name: 'Semi-Modular',
                keywords: ['semi modular', 'semi-modular', 'parcialmente modular'],
                priority: 2
            },
            NO_MODULAR: {
                id: 'no-modular',
                name: 'No Modular',
                keywords: ['no modular', 'fixed', 'cables fijos'],
                priority: 3
            }
        }
    },

    'memorias ram': {
        name: 'Memorias RAM',
        types: {
            DDR5: {
                id: 'ddr5',
                name: 'DDR5',
                keywords: ['ddr5', 'ddr 5'],
                priority: 1
            },
            DDR4: {
                id: 'ddr4',
                name: 'DDR4',
                keywords: ['ddr4', 'ddr 4'],
                priority: 2
            }
        }
    }
};