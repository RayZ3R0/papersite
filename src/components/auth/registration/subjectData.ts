import { Subject, SubjectLevel, SubjectCategory } from '@/types/registration';

export const registrationSubjects: Record<string, Subject> = {
    'YCH11': {
        code: 'YCH11',
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
        code: 'YPH11',
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
        code: 'YBI11',
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
    'YMA11': {
        code: 'YMA11',
        name: 'Mathematics',
        type: 'AS',
        category: 'Mathematics',
        units: [
            { id: 'WMA11', name: 'Pure Mathematics 1', description: 'Core algebra, functions, coordinate geometry' },
            { id: 'WMA12', name: 'Pure Mathematics 2', description: 'Series, differentiation, integration' },
            { id: 'WMA13', name: 'Pure Mathematics 3', description: 'Advanced functions, numerical methods' },
            { id: 'WMA14', name: 'Pure Mathematics 4', description: 'Vectors, differential equations' },
            { id: 'WME01', name: 'Mechanics 1', description: 'Kinematics, forces, Newton\'s laws' },
            { id: 'WME02', name: 'Mechanics 2', description: 'Momentum, circular motion, work and energy' },
            { id: 'WME03', name: 'Mechanics 3', description: 'Equilibrium, motion in a circle, elasticity' },
            { id: 'WST01', name: 'Statistics 1', description: 'Representation of data, probability' },
            { id: 'WST02', name: 'Statistics 2', description: 'Continuous distributions, hypothesis testing' },
            { id: 'WST03', name: 'Statistics 3', description: 'Combinations, distributions, inference' },
            { id: 'WDM11', name: 'Decision Mathematics 1', description: 'Algorithms, graph theory' },
            { id: 'WFM01', name: 'Further Pure Mathematics 1', description: 'Complex numbers, matrices, proof' },
            { id: 'WFM02', name: 'Further Pure Mathematics 2', description: 'Hyperbolic functions, polar coordinates' },
            { id: 'WFM03', name: 'Further Pure Mathematics 3', description: 'Advanced calculus, series' }
        ]
    },
    'YEC11': {
    code: 'YEC11',
    name: 'Economics',
    type: 'AS',
    category: 'Economics',
    units: [
        { id: 'WEC11', name: 'Unit 1: Markets and Market Failure', description: 'Introduction to microeconomics, supply and demand, market structures, and market failure' },
        { id: 'WEC12', name: 'Unit 2: The National Economy', description: 'Macroeconomics, economic growth, inflation, unemployment, fiscal and monetary policy' },
        { id: 'WEC13', name: 'Unit 3: Business Economics and Economic Efficiency', description: 'Business objectives, costs, revenues, competition, and economic efficiency' },
        { id: 'WEC14', name: 'Unit 4: The Global Economy', description: 'International trade, globalization, development economics, and exchange rates' }
    ]
    },
    'YBS11': {
    code: 'YBS11',
    name: 'Business Studies',
    type: 'AS',
    category: 'Business Studies',
    units: [
        { id: 'WBS11', name: 'Unit 1: Marketing and People', description: 'Marketing strategies, human resource management, and leadership' },
        { id: 'WBS12', name: 'Unit 2: Managing Business Activities', description: 'Finance, operations management, and business planning' },
        { id: 'WBS13', name: 'Unit 3: Business Decisions and Strategy', description: 'Decision-making, risk management, and corporate strategy' },
        { id: 'WBS14', name: 'Unit 4: Global Business', description: 'International business, globalization, and multinational corporations' }
    ]
    },
    'YET01': {
    code: 'YET01',
    name: 'English Literature',
    type: 'AS',
    category: 'English Literature',
    units: [
        { id: 'WET01', name: 'Unit 1: Post-2000 Poetry and Prose', description: 'Study of modern poetry and prose texts' },
        { id: 'WET02', name: 'Unit 2: Drama', description: 'Analysis of dramatic texts, including Shakespeare' },
        { id: 'WET03', name: 'Unit 3: Poetry and Prose', description: 'Study of poetry and prose from different historical periods' },
        { id: 'WET04', name: 'Unit 4: Shakespeare and Pre-1900 Poetry', description: 'In-depth study of Shakespeare and pre-1900 poetry' }
    ]
    },
    'YEN01': {
    code: 'YEN01',
    name: 'English Language',
    type: 'AS',
    category: 'English Language',
    units: [
        { id: 'WEN01', name: 'Unit 1: Language Variation', description: 'Study of language diversity and change over time' },
        { id: 'WEN02', name: 'Unit 2: Child Language', description: 'Exploration of language acquisition in children' },
        { id: 'WEN03', name: 'Unit 3: Investigating Language', description: 'Analysis of language use in different contexts' },
        { id: 'WEN04', name: 'Unit 4: Crafting Language', description: 'Creative writing and language in society' }
    ]
    },
    'YHI01': {
    code: 'YHI01',
    name: 'History',
    type: 'AS',
    category: 'History',
    units: [
        { id: 'WHI01 1A', name: 'Unit 1 - Option 1A: France in Revolution, 1774-99', description: 'Study of the French Revolution period' },
        { id: 'WHI01 1B', name: 'Unit 1 - Option 1B: Russia in Revolution, 1881-1917', description: 'Study of revolutionary Russia' },
        { id: 'WHI01 1C', name: 'Unit 1 - Option 1C: Germany, 1918-45', description: 'Study of Germany from Weimar Republic to Nazi regime' },
        { id: 'WHI01 1D', name: 'Unit 1 - Option 1D: Britain, 1964-90', description: 'Study of post-war British politics and society' },
        { id: 'WHI02 1A', name: 'Unit 2 - Option 1A: India, 1857-1948: The Raj to Partition', description: 'Study of British India to independence' },
        { id: 'WHI02 1B', name: 'Unit 2 - Option 1B: China, 1900-76', description: 'Study of revolutionary China' },
        { id: 'WHI02 1C', name: 'Unit 2 - Option 1C: Russia, 1917-91: From Lenin to Yeltsin', description: 'Study of Soviet Russia' },
        { id: 'WHI02 1D', name: 'Unit 2 - Option 1D: South Africa, 1948-2014', description: 'Study of Apartheid and post-Apartheid South Africa' },
        { id: 'WHI03 1A', name: 'Unit 3 - Option 1A: The USA, Independence to Civil War, 1763-1865', description: 'Study of early American history' },
        { id: 'WHI03 1B', name: 'Unit 3 - Option 1B: The British Experience of Warfare, 1803-1945', description: 'Study of British military history' },
        { id: 'WHI03 1C', name: 'Unit 3 - Option 1C: Germany: United, Divided and Reunited, 1870-1990', description: 'Study of German unification and division' },
        { id: 'WHI03 1D', name: 'Unit 3 - Option 1D: Civil Rights and Race Relations in the USA, 1865-2009', description: 'Study of American civil rights history' },
        { id: 'WHI04 1A', name: 'Unit 4 - Option 1A: The Making of Modern Europe, 1805-71', description: 'Study of 19th century European history' },
        { id: 'WHI04 1B', name: 'Unit 4 - Option 1B: The World in Crisis, 1879-1945', description: 'Study of global conflicts and crises' },
        { id: 'WHI04 1C', name: 'Unit 4 - Option 1C: The World Divided: Superpower Relations, 1943-90', description: 'Study of Cold War history' },
        { id: 'WHI04 1D', name: 'Unit 4 - Option 1D: The Cold War and Hot War in Asia, 1945-90', description: 'Study of Cold War conflicts in Asia' }
    ]
    },
    'YGE01': {
    code: 'YGE01',
    name: 'Geography',
    type: 'AS',
    category: 'Geography',
    units: [
        { id: 'WGE01', name: 'Unit 1: Global Challenges', description: 'Hazards, globalization, and geographical issues' },
        { id: 'WGE02', name: 'Unit 2: Geographical Investigations', description: 'Fieldwork and research skills in geography' },
        { id: 'WGE03', name: 'Unit 3: Contested Planet', description: 'Energy, water, biodiversity, and development' },
        { id: 'WGE04', name: 'Unit 4: Human Systems and Geopolitics', description: 'Population, urban systems, and global power' }
    ]
    },
    'YPS01': {
    code: 'YPS01',
    name: 'Psychology',
    type: 'AS',
    category: 'Psychology',
    units: [
        { id: 'WPS01', name: 'Unit 1: Social and Cognitive Psychology', description: 'Social influence, memory, and perception' },
        { id: 'WPS02', name: 'Unit 2: Biological Psychology and Learning', description: 'Biological basis of behavior and learning theories' },
        { id: 'WPS03', name: 'Unit 3: Applications of Psychology', description: 'Clinical and criminological psychology applications' },
        { id: 'WPS04', name: 'Unit 4: Psychological Skills', description: 'Advanced topics and research methods in psychology' }
    ]
    },
    'YLA11': {
    code: 'YLA11',
    name: 'Law',
    type: 'AS',
    category: 'Law',
    units: [
        { id: 'YLA1 01', name: 'Unit 1: Law Making and Legal System', description: 'Processes of law making and the legal system' },
        { id: 'YLA1 02', name: 'Unit 2: The Concept of Liability', description: 'Criminal and civil liability principles' },
    ]
    },
    'YAC11': {
    code: 'YAC11',
    name: 'Accounting',
    type: 'AS',
    category: 'Accounting',
    units: [
        { id: 'WAC11', name: 'Unit 1: The Accounting System and Costing', description: 'Double-entry bookkeeping and costing methods' },
        { id: 'WAC12', name: 'Unit 2: Financial Accounting', description: 'Preparation of financial statements' },
        { id: 'WAC13', name: 'Unit 3: Management Accounting', description: 'Budgeting and decision-making techniques' },
        { id: 'WAC14', name: 'Unit 4: Corporate Accounting', description: 'Accounting for businesses and investment appraisal' }
    ]
    },
    'YIT11': {
    code: 'YIT11',
    name: 'Information Technology (IT)',
    type: 'AS',
    category: 'Information Technology',
    units: [
        { id: 'WIT11', name: 'Unit 1: IT Systems', description: 'Fundamentals of hardware, software, and networks' },
        { id: 'WIT12', name: 'Unit 2: Data and Information', description: 'Data management and information systems' },
        { id: 'WIT13', name: 'Unit 3: IT in Organizations', description: 'IT applications in business and society' },
        { id: 'WIT14', name: 'Unit 4: Project Management', description: 'Planning and managing IT projects' }
    ]
    },
    'YFR01': {
    code: 'YFR01',
    name: 'French',
    type: 'AS',
    category: 'French',
    units: [
        { id: 'WFR01', name: 'Unit 1: Spoken Expression and Response', description: 'Oral skills and discussion in French' },
        { id: 'WFR02', name: 'Unit 2: Understanding and Written Response', description: 'Listening, reading, and writing skills' },
        { id: 'WFR03', name: 'Unit 3: Understanding and Spoken Response', description: 'Advanced oral response and debate' },
        { id: 'WFR04', name: 'Unit 4: Research, Understanding and Written Response', description: 'Research-based writing and comprehension' }
    ]
    },
    'YGN01': {
    code: 'YGN01',
    name: 'German',
    type: 'AS',
    category: 'German',
    units: [
        { id: 'WGN01', name: 'Unit 1: Spoken Expression and Response', description: 'Oral skills and discussion in German' },
        { id: 'WGN02', name: 'Unit 2: Understanding and Written Response', description: 'Listening, reading, and writing skills' },
        { id: 'WGN03', name: 'Unit 3: Understanding and Spoken Response', description: 'Advanced oral response and debate' },
        { id: 'WGN04', name: 'Unit 4: Research, Understanding and Written Response', description: 'Research-based writing and comprehension' }
    ]
    },
    'YSP01': {
    code: 'YSP01',
    name: 'Spanish',
    type: 'AS',
    category: 'Spanish',
    units: [
        { id: 'WSP01', name: 'Unit 1: Spoken Expression and Response', description: 'Oral skills and discussion in Spanish' },
        { id: 'WSP02', name: 'Unit 2: Understanding and Written Response', description: 'Listening, reading, and writing skills' },
        { id: 'WSP03', name: 'Unit 3: Understanding and Spoken Response', description: 'Advanced oral response and debate' },
        { id: 'WSP04', name: 'Unit 4: Research, Understanding and Written Response', description: 'Research-based writing and comprehension' }
    ]
    },
    'YAA01': {
    code: 'YAA01',
    name: 'Arabic',
    type: 'AS',
    category: 'Arabic',
    units: [
        { id: 'WAA01', name: 'Unit 1: Spoken Expression and Response', description: 'Oral skills and discussion in Arabic' },
        { id: 'WAA02', name: 'Unit 2: Understanding and Written Response', description: 'Listening, reading, and writing skills' },
    ]
    },
    'YGK01': {
    code: 'YGK01',
    name: 'Greek',
    type: 'AS',
    category: 'Greek',
    units: [
        { id: 'WGK01', name: 'Unit 1: Spoken Expression and Response', description: 'Oral skills and discussion in Greek' },
        { id: 'WGK02', name: 'Unit 2: Understanding and Written Response', description: 'Listening, reading, and writing skills' },
    ]
    },
    
};
