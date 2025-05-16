import { Subject } from '@/types/registration';

export const mockSubjects: Record<string, Subject> = {
    'MATH': {
        code: 'MATH',
        name: 'Mathematics',
        type: 'AS',
        category: 'Mathematics',
        units: [
            {
                id: 'P1',
                name: 'Pure Mathematics 1',
                description: 'Core algebra, trigonometry and calculus'
            },
            {
                id: 'P2',
                name: 'Pure Mathematics 2',
                description: 'Advanced algebra and calculus concepts'
            },
            {
                id: 'P3',
                name: 'Pure Mathematics 3',
                description: 'Further pure mathematics topics'
            },
            {
                id: 'P4',
                name: 'Pure Mathematics 4',
                description: 'Advanced pure mathematics concepts'
            },
            {
                id: 'M1',
                name: 'Mechanics 1',
                description: 'Basic mechanics and motion'
            },
            {
                id: 'M2',
                name: 'Mechanics 2',
                description: 'Advanced mechanics concepts'
            },
            {
                id: 'S1',
                name: 'Statistics 1',
                description: 'Basic statistics and probability'
            },
            {
                id: 'S2',
                name: 'Statistics 2',
                description: 'Advanced statistical methods'
            }
        ]
    },

    'FMATH': {
        code: 'FMATH',
        name: 'Further Mathematics',
        type: 'AS',
        category: 'Further Mathematics',
        units: [
            {
                id: 'FP1',
                name: 'Further Pure Mathematics 1',
                description: 'Advanced mathematical concepts'
            },
            {
                id: 'FP2',
                name: 'Further Pure Mathematics 2',
                description: 'Complex analysis and methods'
            },
            {
                id: 'FP3',
                name: 'Further Pure Mathematics 3',
                description: 'Advanced pure mathematical topics'
            }
        ]
    },

    'PHYS': {
        code: 'PHYS',
        name: 'Physics',
        type: 'AS',
        category: 'Physics',
        units: [
            {
                id: 'PH1',
                name: 'Mechanics and Materials',
                description: 'Forces, motion, and material properties'
            },
            {
                id: 'PH2',
                name: 'Waves and Electricity',
                description: 'Wave phenomena and electrical concepts'
            },
            {
                id: 'PH3',
                name: 'Practical Skills I',
                description: 'Experimental techniques and data analysis'
            },
            {
                id: 'PH4',
                name: 'Fields and Further Mechanics',
                description: 'Gravitational and electric fields'
            },
            {
                id: 'PH5',
                name: 'Nuclear and Thermal Physics',
                description: 'Nuclear processes and thermal properties'
            },
            {
                id: 'PH6',
                name: 'Practical Skills II',
                description: 'Advanced experimental techniques'
            }
        ]
    },

    'CHEM': {
        code: 'CHEM',
        name: 'Chemistry',
        type: 'AS',
        category: 'Chemistry',
        units: [
            {
                id: 'CH1',
                name: 'Physical Chemistry',
                description: 'Fundamental chemical processes'
            },
            {
                id: 'CH2',
                name: 'Organic Chemistry',
                description: 'Carbon compounds and reactions'
            },
            {
                id: 'CH3',
                name: 'Practical Skills I',
                description: 'Experimental techniques and data analysis'
            },
            {
                id: 'CH4',
                name: 'Physical Chemistry 2',
                description: 'Advanced chemical processes'
            },
            {
                id: 'CH5',
                name: 'Organic Chemistry 2',
                description: 'Complex organic synthesis'
            },
            {
                id: 'CH6',
                name: 'Practical Skills II',
                description: 'Advanced experimental techniques'
            }
        ]
    },

    'BIO': {
        code: 'BIO',
        name: 'Biology',
        type: 'AS',
        category: 'Biology',
        units: [
            {
                id: 'BIO1',
                name: 'Cell Biology',
                description: 'Cell structure and processes'
            },
            {
                id: 'BIO2',
                name: 'Genetics and Evolution',
                description: 'DNA and evolutionary processes'
            },
            {
                id: 'BIO4',
                name: 'Energy and Environment',
                description: 'Ecosystems and energy cycles'
            },
            {
                id: 'BIO5',
                name: 'Control and Homeostasis',
                description: 'Biological regulation systems'
            }
        ]
    }
};
