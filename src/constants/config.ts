export const SYSTEM_CONFIG = {
  total_planets: 99,
  total_systems: 33,
  coordinate_system: "hex_grid",
  fuel_calculation: (distance: number) => Math.ceil(distance),
  death_handling: "reload_last_save",
  no_emergency_fuel: true,
  mature_content: "18+",
  max_context_tokens: 200000,
  gm_model: "gemini-2.0-flash"
};

export const WEAPONS = {
  'plasma_torch': { damage: 20, type: 'energy', special: 'starting' },
  'pulse_rifle': { damage: 35, type: 'energy', special: 'standard' },
  'rail_pistol': { damage: 40, type: 'kinetic', special: 'armor_piercing' },
  'microwave_cannon': { damage: 45, type: 'radiation', special: 'internal_damage' },
  'neural_disruptor': { damage: 30, type: 'neural', special: 'double_vs_synthetics' },
  'shard_launcher': { damage: 55, type: 'spread', special: 'multi_target' },
  'flesh_melter': { damage: 60, type: 'chemical', special: 'banned_weapon' },
  'void_rifle': { damage: 70, type: 'exotic', special: 'ignores_armor' },
  'thermite_charge': { damage: 80, type: 'explosive', special: 'consumable_area' },
  'emp_grenade': { damage: 50, type: 'explosive', special: 'consumable_vs_synthetics' }
};