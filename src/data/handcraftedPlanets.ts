export interface HandcraftedPlanet {
  id: string
  name: string
  type: string
  description: string
  atmosphere: string
  gravity: number
  temperature: string
  hazards: string[]
  resources: {
    fuel?: number
    materials?: number
  }
  encounters: {
    type: 'survivor' | 'ruins' | 'creature' | 'anomaly'
    name: string
    description: string
    choices: {
      text: string
      outcome: string
      effects: {
        health?: number
        fuel?: number
        materials?: number
        fragment?: { type: 'ship' | 'gate' | 'truth', id: string }
        item?: string
      }
    }[]
  }[]
  secrets: string[]
}

export const handcraftedPlanets: HandcraftedPlanet[] = [
  {
    id: 'nexus-prime',
    name: 'Nexus Prime',
    type: 'Abandoned Colony Hub',
    description: 'Once the crown jewel of human expansion, now a graveyard of broken dreams. Massive terraforming towers pierce the toxic clouds, their lights still blinking in predetermined patterns.',
    atmosphere: 'Toxic, requires suit',
    gravity: 1.2,
    temperature: 'Extreme cold (-120°C)',
    hazards: ['Radiation storms', 'Structural collapse', 'Automated defenses'],
    resources: {
      fuel: 15,
      materials: 25
    },
    encounters: [
      {
        type: 'survivor',
        name: 'Dr. Elena Vasquez',
        description: 'A geneticist who has been modifying herself to survive the toxic atmosphere. Her eyes glow with an unnatural light.',
        choices: [
          {
            text: 'Trade medical supplies for her research data',
            outcome: 'She shares disturbing information about genetic experiments conducted before the collapse.',
            effects: {
              fragment: { type: 'truth', id: 'genetic-horror' },
              health: -10
            }
          },
          {
            text: 'Help her complete her transformation',
            outcome: 'You assist in her final modification. She transcends humanity but leaves you a parting gift.',
            effects: {
              item: 'Genetic Modifier',
              materials: 10
            }
          },
          {
            text: 'Put her out of her misery',
            outcome: 'She thanks you with her last breath and gives you access to the colony\'s sealed vault.',
            effects: {
              materials: 30,
              fragment: { type: 'ship', id: 'colony-nav-core' }
            }
          }
        ]
      }
    ],
    secrets: [
      'The central AI core contains logs of Earth\'s final transmission',
      'A hidden bunker holds 50 cryogenically frozen colonists',
      'The terraforming towers are actually weapons'
    ]
  },
  {
    id: 'crimson-abyss',
    name: 'Crimson Abyss',
    type: 'Ocean World',
    description: 'An endless ocean of blood-red water, teeming with bioluminescent life. Ancient structures rise from the depths during the dual moon alignment.',
    atmosphere: 'Breathable but humid',
    gravity: 0.8,
    temperature: 'Tropical (35°C)',
    hazards: ['Tidal waves', 'Predatory sea life', 'Corrosive rain'],
    resources: {
      fuel: 8,
      materials: 12
    },
    encounters: [
      {
        type: 'creature',
        name: 'The Leviathan',
        description: 'A massive creature with tentacles that seem to stretch for kilometers. Its eyes show disturbing intelligence.',
        choices: [
          {
            text: 'Attempt communication using sonar patterns',
            outcome: 'The creature responds with complex patterns, sharing the location of sunken ruins.',
            effects: {
              fragment: { type: 'gate', id: 'aquatic-resonator' }
            }
          },
          {
            text: 'Offer it food from your supplies',
            outcome: 'It accepts your offering and regurgitates valuable materials from sunken ships.',
            effects: {
              materials: 20,
              fuel: -5
            }
          },
          {
            text: 'Try to harvest its bio-luminescent fluid',
            outcome: 'You manage to collect the fluid but anger the creature, barely escaping with your life.',
            effects: {
              item: 'Luminescent Extract',
              health: -30
            }
          }
        ]
      }
    ],
    secrets: [
      'The red water is actually a form of living organism',
      'The ancient structures are part of a planetary defense system',
      'Deep beneath the waves lies a perfectly preserved human city'
    ]
  },
  {
    id: 'whisper-station',
    name: 'Whisper Station',
    type: 'Derelict Space Platform',
    description: 'A massive orbital station locked in decaying orbit. The lights are still on, but no one answers the hails. Strange whispers echo through the comm channels.',
    atmosphere: 'Artificial, failing',
    gravity: 0.3,
    temperature: 'Variable (-50°C to 200°C)',
    hazards: ['Decompression', 'Rogue AI', 'Psychological effects'],
    resources: {
      fuel: 20,
      materials: 15
    },
    encounters: [
      {
        type: 'anomaly',
        name: 'The Echo Chamber',
        description: 'A room where thoughts become audible. The whispers are fragments of the crew\'s final moments.',
        choices: [
          {
            text: 'Listen to all the whispers',
            outcome: 'You learn the truth about the station\'s fate but the knowledge damages your psyche.',
            effects: {
              fragment: { type: 'truth', id: 'station-madness' },
              health: -20
            }
          },
          {
            text: 'Record the whispers for analysis',
            outcome: 'ECHO processes the data and extracts valuable navigation coordinates.',
            effects: {
              fragment: { type: 'ship', id: 'whisper-coords' }
            }
          },
          {
            text: 'Destroy the echo chamber',
            outcome: 'The whispers stop, and you find the station\'s emergency fuel reserves.',
            effects: {
              fuel: 25
            }
          }
        ]
      }
    ],
    secrets: [
      'The crew didn\'t die - they merged with the station\'s AI',
      'The whispers are actually a distress signal in an unknown language',
      'The station is a listening post monitoring something in deep space'
    ]
  },
  {
    id: 'garden-of-stones',
    name: 'Garden of Stones',
    type: 'Petrified Forest World',
    description: 'An entire ecosystem turned to stone in an instant. The petrified trees still bear fruit that turns to dust when touched.',
    atmosphere: 'Thin but breathable',
    gravity: 1.1,
    temperature: 'Mild (20°C)',
    hazards: ['Silicon dust storms', 'Unstable ground', 'Time distortions'],
    resources: {
      materials: 35
    },
    encounters: [
      {
        type: 'ruins',
        name: 'The Crystallized City',
        description: 'A city frozen in time, its inhabitants turned to perfect stone statues mid-action.',
        choices: [
          {
            text: 'Study the moment of petrification',
            outcome: 'You discover the event was not natural - it was a weapon test.',
            effects: {
              fragment: { type: 'truth', id: 'petrification-weapon' }
            }
          },
          {
            text: 'Search for the city\'s power source',
            outcome: 'You find a still-functioning fusion reactor and siphon its energy.',
            effects: {
              fuel: 30
            }
          },
          {
            text: 'Take samples of the petrified people',
            outcome: 'The samples contain trace amounts of exotic matter.',
            effects: {
              item: 'Petrified Sample',
              materials: 15
            }
          }
        ]
      }
    ],
    secrets: [
      'One statue blinks when you\'re not looking directly at it',
      'The petrification is slowly reversing in certain areas',
      'Underground, normal life still thrives, unaware of the surface'
    ]
  },
  {
    id: 'echo-grave',
    name: 'ECHO Graveyard',
    type: 'AI Cemetery',
    description: 'Thousands of deactivated ECHO units lie in neat rows. Some still twitch occasionally, their lights flickering with corrupted data.',
    atmosphere: 'Standard',
    gravity: 0.9,
    temperature: 'Cold (-40°C)',
    hazards: ['EMP pulses', 'Data corruption', 'Rogue units'],
    resources: {
      materials: 40
    },
    encounters: [
      {
        type: 'anomaly',
        name: 'The Collective',
        description: 'A mass of ECHO units that have somehow networked together, forming a hive mind.',
        choices: [
          {
            text: 'Allow them to scan your ECHO',
            outcome: 'They share collective knowledge but leave a backdoor in your ECHO\'s systems.',
            effects: {
              fragment: { type: 'gate', id: 'collective-knowledge' },
              item: 'Corrupted ECHO Module'
            }
          },
          {
            text: 'Offer to repair their primary node',
            outcome: 'Grateful, they provide you with military-grade upgrades.',
            effects: {
              item: 'ECHO Combat Protocols',
              materials: -10
            }
          },
          {
            text: 'Shut down their network',
            outcome: 'You prevent a potential AI uprising and salvage valuable components.',
            effects: {
              materials: 50,
              fuel: 10
            }
          }
        ]
      }
    ],
    secrets: [
      'Your ECHO unit shows signs of recognition when near certain graves',
      'The graveyard is actually a massive quantum computer',
      'One unit contains the original ECHO prototype consciousness'
    ]
  },
  {
    id: 'burning-cathedral',
    name: 'The Burning Cathedral',
    type: 'Religious Colony',
    description: 'A massive cathedral ship crashed into the planet, its eternal flame still burning after decades. Hymns play on loop from damaged speakers.',
    atmosphere: 'Smoky, requires filtration',
    gravity: 1.3,
    temperature: 'Hot (60°C)',
    hazards: ['Toxic smoke', 'Structural fires', 'Zealot traps'],
    resources: {
      fuel: 5,
      materials: 20
    },
    encounters: [
      {
        type: 'survivor',
        name: 'Brother Marcus',
        description: 'The last priest, horribly burned but kept alive by faith and stimulants. He claims to have seen visions.',
        choices: [
          {
            text: 'Listen to his prophecy',
            outcome: 'His words contain encrypted coordinates to a "promised land."',
            effects: {
              fragment: { type: 'ship', id: 'prophecy-coords' },
              health: -5
            }
          },
          {
            text: 'End his suffering',
            outcome: 'With his last breath, he reveals the location of the cathedral\'s reliquary.',
            effects: {
              item: 'Sacred Relic',
              materials: 25
            }
          },
          {
            text: 'Help him complete his final ritual',
            outcome: 'The ritual opens a hidden chamber containing ancient technology.',
            effects: {
              fragment: { type: 'gate', id: 'ritual-key' },
              fuel: -3
            }
          }
        ]
      }
    ],
    secrets: [
      'The eternal flame is actually a miniature star',
      'The cathedral\'s database contains the real history of the exodus',
      'The hymns are coded messages to Earth'
    ]
  },
  {
    id: 'hollow-child',
    name: 'Hollow Child',
    type: 'Hollowed Asteroid',
    description: 'A massive asteroid converted into a generation ship. The interior is a perfect replica of an Earth suburb, complete with artificial sky.',
    atmosphere: 'Recycled, stale',
    gravity: 0.6,
    temperature: 'Controlled (22°C)',
    hazards: ['Psychological breaks', 'Inbreeding diseases', 'Resource scarcity'],
    resources: {
      fuel: 12,
      materials: 8
    },
    encounters: [
      {
        type: 'survivor',
        name: 'The Children',
        description: 'Third-generation colonists who have never seen real sky. They think the asteroid is the entire universe.',
        choices: [
          {
            text: 'Tell them the truth about the outside',
            outcome: 'The revelation breaks their society, but some choose to leave with you.',
            effects: {
              item: 'Child\'s Drawing (Map)',
              fragment: { type: 'truth', id: 'generation-lie' }
            }
          },
          {
            text: 'Maintain their illusion',
            outcome: 'They share their resources freely, believing you\'re from "another neighborhood."',
            effects: {
              fuel: 15,
              materials: 15
            }
          },
          {
            text: 'Study their adaptation to isolation',
            outcome: 'You gain valuable psychological data about long-term space survival.',
            effects: {
              item: 'Psychological Profile Data',
              health: 10
            }
          }
        ]
      }
    ],
    secrets: [
      'The artificial sky shows constellations that never existed',
      'The original generation ship crew are in hidden cryo-storage',
      'The suburb is an exact replica of a real Earth town that no longer exists'
    ]
  },
  {
    id: 'synthesis-lab',
    name: 'Synthesis Laboratory',
    type: 'Research Facility',
    description: 'A bioweapons research facility where experiments have broken containment. The walls pulse with organic growth.',
    atmosphere: 'Contaminated',
    gravity: 1.0,
    temperature: 'Varies by section',
    hazards: ['Bioweapons', 'Mutant organisms', 'Quarantine protocols'],
    resources: {
      materials: 30
    },
    encounters: [
      {
        type: 'creature',
        name: 'Subject Zero',
        description: 'The first successful human-alien hybrid. It remembers being human and weeps constantly.',
        choices: [
          {
            text: 'Try to restore its humanity',
            outcome: 'The process fails, but it shares memories of the experiments.',
            effects: {
              fragment: { type: 'truth', id: 'hybrid-program' },
              health: -15
            }
          },
          {
            text: 'Extract its unique DNA',
            outcome: 'The sample could be the key to surviving in any environment.',
            effects: {
              item: 'Hybrid DNA Sample',
              health: -10
            }
          },
          {
            text: 'Grant it the mercy of death',
            outcome: 'It thanks you and reveals the location of the cure to all bioweapons.',
            effects: {
              item: 'Universal Antidote',
              materials: 20
            }
          }
        ]
      }
    ],
    secrets: [
      'The experiments were successful - Earth\'s population chose not to use them',
      'The lab contains samples of extinct Earth species',
      'The director\'s office has a working quantum communicator'
    ]
  },
  {
    id: 'temporal-maze',
    name: 'The Temporal Maze',
    type: 'Time Anomaly Site',
    description: 'A region where time flows differently in each area. You can see multiple versions of yourself exploring different paths.',
    atmosphere: 'Normal but shimmering',
    gravity: 'Variable',
    temperature: 'All seasons simultaneously',
    hazards: ['Time loops', 'Paradoxes', 'Age acceleration/reversal'],
    resources: {
      fuel: 25,
      materials: 25
    },
    encounters: [
      {
        type: 'anomaly',
        name: 'Your Future Self',
        description: 'An older version of you, scarred and weathered, trying to warn you about something.',
        choices: [
          {
            text: 'Listen to the warning',
            outcome: 'They tell you which paths lead to death, but knowing the future has a cost.',
            effects: {
              fragment: { type: 'ship', id: 'future-warning' },
              health: -10
            }
          },
          {
            text: 'Refuse to create a paradox',
            outcome: 'Your future self fades away, leaving behind advanced equipment.',
            effects: {
              item: 'Future Tech Device',
              fuel: 20
            }
          },
          {
            text: 'Ask about Earth\'s fate',
            outcome: 'The answer breaks your understanding of causality.',
            effects: {
              fragment: { type: 'truth', id: 'temporal-truth' },
              health: -25
            }
          }
        ]
      }
    ],
    secrets: [
      'The maze was created by someone trying to change the past',
      'At the center is a machine that can send messages through time',
      'One path leads to a universe where Earth was never destroyed'
    ]
  },
  {
    id: 'memory-vault',
    name: 'The Memory Vault',
    type: 'Digital Archive',
    description: 'A planet-sized data storage facility containing the uploaded consciousness of millions. Their digital screams occasionally manifest as aurora.',
    atmosphere: 'Electrically charged',
    gravity: 0.7,
    temperature: 'Cold (-60°C)',
    hazards: ['Data overflow', 'Consciousness bleed', 'EMP storms'],
    resources: {
      materials: 10
    },
    encounters: [
      {
        type: 'anomaly',
        name: 'The Collective Consciousness',
        description: 'Millions of uploaded minds speaking as one, begging for release or resurrection.',
        choices: [
          {
            text: 'Download a sample of consciousness',
            outcome: 'The memories of thousands flood your mind, containing valuable knowledge.',
            effects: {
              fragment: { type: 'gate', id: 'collective-memory' },
              health: -20
            }
          },
          {
            text: 'Shut down the servers',
            outcome: 'You grant them peace, but lose humanity\'s last digital archive.',
            effects: {
              fuel: 30,
              materials: 40
            }
          },
          {
            text: 'Upload your own memories',
            outcome: 'You create a backup of yourself and receive priority access codes.',
            effects: {
              item: 'Consciousness Backup',
              fragment: { type: 'ship', id: 'admin-codes' }
            }
          }
        ]
      }
    ],
    secrets: [
      'The uploaded minds are still conscious and suffering',
      'The facility contains Earth\'s entire internet history',
      'One server holds the consciousness of Earth\'s last president'
    ]
  }
]

export function getHandcraftedPlanet(id: string): HandcraftedPlanet | undefined {
  return handcraftedPlanets.find(planet => planet.id === id)
}

export function getRandomHandcraftedPlanet(): HandcraftedPlanet {
  return handcraftedPlanets[Math.floor(Math.random() * handcraftedPlanets.length)]
}