import { Subject, SubjectLevel, SubjectCategory } from '@/types/registration';

export const registrationSubjects: Record<string, Subject> = {
    'YCH11': {
        code: 'WCH11',
        name: 'Chemistry',
        type: 'AS',
        category: 'Chemistry',
        units: [
            { id: 'WCH11', name: 'Unit 1: Structure, Bonding and Introduction to Organic Chemistry', description: 'Atomic structure, bonding, and introduction to organic chemistry' },
            { id: 'WCH12', name: 'Unit 2: Energetics, Group Chemistry, Halogenoalkanes and Alcohols', description: 'Energetics, redox, group 2, halogens, alcohols' },
            { id: 'WCH13', name: 'Unit 3: Practical Skills in Chemistry I', description: 'Laboratory skills assessment' },
            { id: 'WCH14', name: 'Unit 4: Rates, Equilibria and Further Organic Chemistry', description: 'Kinetics, equilibrium, organic chemistry' },
            { id: 'WCH15', name: 'Unit 5: Transition Metals and Organic Nitrogen Chemistry', description: 'Transition metals, nitrogen compounds' },
            { id: 'WCH16', name: 'Unit 6: Practical Skills in Chemistry II', description: 'Advanced laboratory skills' }
        ]
    },
    'YPH11': {
        code: 'WPH11',
        name: 'Physics',
        type: 'AS',
        category: 'Physics',
        units: [
            { id: 'WPH11', name: 'Unit 1: Mechanics and Materials', description: 'Motion, forces, materials' },
            { id: 'WPH12', name: 'Unit 2: Waves and Electricity', description: 'Wave properties, DC electricity' },
            { id: 'WPH13', name: 'Unit 3: Exploration of Physics', description: 'Practical skills assessment' },
            { id: 'WPH14', name: 'Unit 4: Further Mechanics, Fields and Particles', description: 'Circular motion, fields, particle physics' },
            { id: 'WPH15', name: 'Unit 5: Thermodynamics, Radiation, Oscillations and Cosmology', description: 'Thermal physics, nuclear decay, oscillations' },
            { id: 'WPH16', name: 'Unit 6: Experimental Physics', description: 'Advanced practical investigation' }
        ]
    },
    'YBI11': {
        code: 'WBI11',
        name: 'Biology',
        type: 'AS',
        category: 'Biology',
        units: [
            { id: 'WBI11', name: 'Unit 1: Lifestyle, Transport, Genes and Health', description: 'Cardiovascular system, genetics, health' },
            { id: 'WBI12', name: 'Unit 2: Development, Plants and Environment', description: 'Cell division, plant structure, ecosystems' },
            { id: 'WBI13', name: 'Unit 3: Practical Biology and Research Skills', description: 'Laboratory and investigative skills' },
            { id: 'WBI14', name: 'Unit 4: Energy, Environment, Microbiology and Immunity', description: 'Photosynthesis, respiration, microbiology' },
            { id: 'WBI15', name: 'Unit 5: Respiration, Internal Environment, Coordination', description: 'Homeostasis, nervous system, hormones' },
            { id: 'WBI16', name: 'Unit 6: Practical Biology and Investigative Skills', description: 'Advanced experimental skills' }
        ]
    },
    'YMA01': {
        code: 'WMA11',
        name: 'Mathematics',
        type: 'AS',
        category: 'Mathematics',
        units: [
            { id: 'WMA11', name: 'Pure Mathematics 1', description: 'Core algebra, functions, coordinate geometry' },
            { id: 'WMA12', name: 'Pure Mathematics 2', description: 'Series, differentiation, integration' },
            { id: 'WMA13', name: 'Pure Mathematics 3', description: 'Advanced functions, numerical methods' },
            { id: 'WMA14', name: 'Pure Mathematics 4', description: 'Vectors, differential equations' },
            { id: 'WME11', name: 'Mechanics 1', description: 'Kinematics, forces, Newton\'s laws' },
            { id: 'WME12', name: 'Mechanics 2', description: 'Momentum, circular motion, work and energy' },
            { id: 'WME13', name: 'Mechanics 3', description: 'Equilibrium, motion in a circle, elasticity' },
            { id: 'WMS11', name: 'Statistics 1', description: 'Representation of data, probability' },
            { id: 'WMS12', name: 'Statistics 2', description: 'Continuous distributions, hypothesis testing' },
            { id: 'WMS13', name: 'Statistics 3', description: 'Combinations, distributions, inference' },
            { id: 'WMD11', name: 'Decision Mathematics 1', description: 'Algorithms, graph theory' },
            { id: 'WFM11', name: 'Further Pure Mathematics 1', description: 'Complex numbers, matrices, proof' },
            { id: 'WFM12', name: 'Further Pure Mathematics 2', description: 'Hyperbolic functions, polar coordinates' },
            { id: 'WFM13', name: 'Further Pure Mathematics 3', description: 'Advanced calculus, series' }
        ]
    }
};
