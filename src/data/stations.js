/**
 * LIRR Station data with coordinates for all 124 stations.
 */

import { Platform } from 'react-native';
import { IOS_MAX_REGIONS, MAJOR_JUNCTION_COUNT } from '../constants';

// Major junction station identifiers (always monitored)
export const MAJOR_JUNCTIONS = [
    'penn-station',
    'grand-central-madison',
    'jamaica',
    'atlantic-terminal',
    'babylon',
    'ronkonkoma',
    'huntington',
    'port-washington',
    'long-beach',
    'far-rockaway',
];

// All LIRR stations organized by branch
export const LIRR_STATIONS = [
    // Manhattan Terminals
    {
        identifier: 'penn-station',
        name: 'Penn Station',
        latitude: 40.7506,
        longitude: -73.9935,
        branch: 'Main Line',
    },
    {
        identifier: 'grand-central-madison',
        name: 'Grand Central Madison',
        latitude: 40.7527,
        longitude: -73.9772,
        branch: 'Main Line',
    },

    // City Terminal Zone
    {
        identifier: 'atlantic-terminal',
        name: 'Atlantic Terminal',
        latitude: 40.6842,
        longitude: -73.9776,
        branch: 'Atlantic Branch',
    },
    {
        identifier: 'nostrand-avenue',
        name: 'Nostrand Avenue',
        latitude: 40.6695,
        longitude: -73.9505,
        branch: 'Atlantic Branch',
    },
    {
        identifier: 'east-new-york',
        name: 'East New York',
        latitude: 40.6590,
        longitude: -73.8729,
        branch: 'Atlantic Branch',
    },

    // Jamaica (Major Hub)
    {
        identifier: 'jamaica',
        name: 'Jamaica',
        latitude: 40.7001,
        longitude: -73.8076,
        branch: 'Main Line',
    },

    // Main Line (Penn Station to Ronkonkoma)
    {
        identifier: 'woodside',
        name: 'Woodside',
        latitude: 40.7456,
        longitude: -73.9028,
        branch: 'Main Line',
    },
    {
        identifier: 'forest-hills',
        name: 'Forest Hills',
        latitude: 40.7184,
        longitude: -73.8455,
        branch: 'Main Line',
    },
    {
        identifier: 'kew-gardens',
        name: 'Kew Gardens',
        latitude: 40.7096,
        longitude: -73.8304,
        branch: 'Main Line',
    },
    {
        identifier: 'new-hyde-park',
        name: 'New Hyde Park',
        latitude: 40.7318,
        longitude: -73.6875,
        branch: 'Main Line',
    },
    {
        identifier: 'merillon-avenue',
        name: 'Merillon Avenue',
        latitude: 40.7421,
        longitude: -73.6488,
        branch: 'Main Line',
    },
    {
        identifier: 'mineola',
        name: 'Mineola',
        latitude: 40.7474,
        longitude: -73.6406,
        branch: 'Main Line',
    },
    {
        identifier: 'carle-place',
        name: 'Carle Place',
        latitude: 40.7524,
        longitude: -73.6162,
        branch: 'Main Line',
    },
    {
        identifier: 'westbury',
        name: 'Westbury',
        latitude: 40.7565,
        longitude: -73.5889,
        branch: 'Main Line',
    },
    {
        identifier: 'hicksville',
        name: 'Hicksville',
        latitude: 40.7685,
        longitude: -73.5239,
        branch: 'Main Line',
    },
    {
        identifier: 'bethpage',
        name: 'Bethpage',
        latitude: 40.7540,
        longitude: -73.4856,
        branch: 'Main Line',
    },
    {
        identifier: 'farmingdale',
        name: 'Farmingdale',
        latitude: 40.7337,
        longitude: -73.4457,
        branch: 'Main Line',
    },
    {
        identifier: 'pinelawn',
        name: 'Pinelawn',
        latitude: 40.7446,
        longitude: -73.4225,
        branch: 'Main Line',
    },
    {
        identifier: 'wyandanch',
        name: 'Wyandanch',
        latitude: 40.7560,
        longitude: -73.3625,
        branch: 'Main Line',
    },
    {
        identifier: 'deer-park',
        name: 'Deer Park',
        latitude: 40.7618,
        longitude: -73.3287,
        branch: 'Main Line',
    },
    {
        identifier: 'brentwood',
        name: 'Brentwood',
        latitude: 40.7810,
        longitude: -73.2514,
        branch: 'Main Line',
    },
    {
        identifier: 'central-islip',
        name: 'Central Islip',
        latitude: 40.7909,
        longitude: -73.2006,
        branch: 'Main Line',
    },
    {
        identifier: 'ronkonkoma',
        name: 'Ronkonkoma',
        latitude: 40.8093,
        longitude: -73.1155,
        branch: 'Main Line',
    },

    // Greenport Branch (East of Ronkonkoma)
    {
        identifier: 'medford',
        name: 'Medford',
        latitude: 40.8208,
        longitude: -73.0010,
        branch: 'Greenport Branch',
    },
    {
        identifier: 'yaphank',
        name: 'Yaphank',
        latitude: 40.8360,
        longitude: -72.9167,
        branch: 'Greenport Branch',
    },
    {
        identifier: 'riverhead',
        name: 'Riverhead',
        latitude: 40.9178,
        longitude: -72.6618,
        branch: 'Greenport Branch',
    },
    {
        identifier: 'mattituck',
        name: 'Mattituck',
        latitude: 40.9916,
        longitude: -72.5362,
        branch: 'Greenport Branch',
    },
    {
        identifier: 'southold',
        name: 'Southold',
        latitude: 41.0648,
        longitude: -72.4285,
        branch: 'Greenport Branch',
    },
    {
        identifier: 'greenport',
        name: 'Greenport',
        latitude: 41.1014,
        longitude: -72.3604,
        branch: 'Greenport Branch',
    },

    // Babylon Branch
    {
        identifier: 'st-albans',
        name: 'St. Albans',
        latitude: 40.6916,
        longitude: -73.7648,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'locust-manor',
        name: 'Locust Manor',
        latitude: 40.6882,
        longitude: -73.7769,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'laurelton',
        name: 'Laurelton',
        latitude: 40.6767,
        longitude: -73.7457,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'rosedale',
        name: 'Rosedale',
        latitude: 40.6624,
        longitude: -73.7353,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'valley-stream',
        name: 'Valley Stream',
        latitude: 40.6595,
        longitude: -73.7083,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'lynbrook',
        name: 'Lynbrook',
        latitude: 40.6576,
        longitude: -73.6717,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'rockville-centre',
        name: 'Rockville Centre',
        latitude: 40.6587,
        longitude: -73.6414,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'baldwin',
        name: 'Baldwin',
        latitude: 40.6582,
        longitude: -73.6097,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'freeport',
        name: 'Freeport',
        latitude: 40.6574,
        longitude: -73.5833,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'merrick',
        name: 'Merrick',
        latitude: 40.6619,
        longitude: -73.5512,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'bellmore',
        name: 'Bellmore',
        latitude: 40.6679,
        longitude: -73.5270,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'wantagh',
        name: 'Wantagh',
        latitude: 40.6735,
        longitude: -73.5092,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'seaford',
        name: 'Seaford',
        latitude: 40.6750,
        longitude: -73.4882,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'massapequa',
        name: 'Massapequa',
        latitude: 40.6805,
        longitude: -73.4686,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'massapequa-park',
        name: 'Massapequa Park',
        latitude: 40.6802,
        longitude: -73.4546,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'amityville',
        name: 'Amityville',
        latitude: 40.6816,
        longitude: -73.4201,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'copiague',
        name: 'Copiague',
        latitude: 40.6817,
        longitude: -73.3985,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'lindenhurst',
        name: 'Lindenhurst',
        latitude: 40.6877,
        longitude: -73.3735,
        branch: 'Babylon Branch',
    },
    {
        identifier: 'babylon',
        name: 'Babylon',
        latitude: 40.7016,
        longitude: -73.3233,
        branch: 'Babylon Branch',
    },

    // Montauk Branch (East of Babylon)
    {
        identifier: 'bay-shore',
        name: 'Bay Shore',
        latitude: 40.7255,
        longitude: -73.2451,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'islip',
        name: 'Islip',
        latitude: 40.7301,
        longitude: -73.2100,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'great-river',
        name: 'Great River',
        latitude: 40.7323,
        longitude: -73.1632,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'oakdale',
        name: 'Oakdale',
        latitude: 40.7414,
        longitude: -73.1350,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'sayville',
        name: 'Sayville',
        latitude: 40.7384,
        longitude: -73.0823,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'patchogue',
        name: 'Patchogue',
        latitude: 40.7654,
        longitude: -73.0157,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'bellport',
        name: 'Bellport',
        latitude: 40.7720,
        longitude: -72.9453,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'mastic-shirley',
        name: 'Mastic-Shirley',
        latitude: 40.8032,
        longitude: -72.8672,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'speonk',
        name: 'Speonk',
        latitude: 40.8184,
        longitude: -72.7068,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'westhampton',
        name: 'Westhampton',
        latitude: 40.8236,
        longitude: -72.6659,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'hampton-bays',
        name: 'Hampton Bays',
        latitude: 40.8683,
        longitude: -72.5176,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'southampton',
        name: 'Southampton',
        latitude: 40.8952,
        longitude: -72.3902,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'bridgehampton',
        name: 'Bridgehampton',
        latitude: 40.9357,
        longitude: -72.3017,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'east-hampton',
        name: 'East Hampton',
        latitude: 40.9629,
        longitude: -72.1851,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'amagansett',
        name: 'Amagansett',
        latitude: 40.9736,
        longitude: -72.1264,
        branch: 'Montauk Branch',
    },
    {
        identifier: 'montauk',
        name: 'Montauk',
        latitude: 41.0473,
        longitude: -71.9549,
        branch: 'Montauk Branch',
    },

    // Long Beach Branch
    {
        identifier: 'centre-avenue',
        name: 'Centre Avenue',
        latitude: 40.6547,
        longitude: -73.6550,
        branch: 'Long Beach Branch',
    },
    {
        identifier: 'east-rockaway',
        name: 'East Rockaway',
        latitude: 40.6426,
        longitude: -73.6649,
        branch: 'Long Beach Branch',
    },
    {
        identifier: 'oceanside',
        name: 'Oceanside',
        latitude: 40.6386,
        longitude: -73.6400,
        branch: 'Long Beach Branch',
    },
    {
        identifier: 'island-park',
        name: 'Island Park',
        latitude: 40.6048,
        longitude: -73.6555,
        branch: 'Long Beach Branch',
    },
    {
        identifier: 'long-beach',
        name: 'Long Beach',
        latitude: 40.5881,
        longitude: -73.6572,
        branch: 'Long Beach Branch',
    },

    // Far Rockaway Branch
    {
        identifier: 'inwood',
        name: 'Inwood',
        latitude: 40.6217,
        longitude: -73.7490,
        branch: 'Far Rockaway Branch',
    },
    {
        identifier: 'far-rockaway',
        name: 'Far Rockaway',
        latitude: 40.6031,
        longitude: -73.7552,
        branch: 'Far Rockaway Branch',
    },

    // Hempstead Branch
    {
        identifier: 'floral-park',
        name: 'Floral Park',
        latitude: 40.7234,
        longitude: -73.7050,
        branch: 'Hempstead Branch',
    },
    {
        identifier: 'bellerose',
        name: 'Bellerose',
        latitude: 40.7206,
        longitude: -73.7189,
        branch: 'Hempstead Branch',
    },
    {
        identifier: 'queens-village',
        name: 'Queens Village',
        latitude: 40.7179,
        longitude: -73.7361,
        branch: 'Hempstead Branch',
    },
    {
        identifier: 'hollis',
        name: 'Hollis',
        latitude: 40.7114,
        longitude: -73.7623,
        branch: 'Hempstead Branch',
    },
    {
        identifier: 'stewart-manor',
        name: 'Stewart Manor',
        latitude: 40.7198,
        longitude: -73.6882,
        branch: 'Hempstead Branch',
    },
    {
        identifier: 'nassau-boulevard',
        name: 'Nassau Boulevard',
        latitude: 40.7131,
        longitude: -73.6650,
        branch: 'Hempstead Branch',
    },
    {
        identifier: 'garden-city',
        name: 'Garden City',
        latitude: 40.7267,
        longitude: -73.6433,
        branch: 'Hempstead Branch',
    },
    {
        identifier: 'country-life-press',
        name: 'Country Life Press',
        latitude: 40.7231,
        longitude: -73.6320,
        branch: 'Hempstead Branch',
    },
    {
        identifier: 'hempstead',
        name: 'Hempstead',
        latitude: 40.7018,
        longitude: -73.6196,
        branch: 'Hempstead Branch',
    },

    // West Hempstead Branch
    {
        identifier: 'west-hempstead',
        name: 'West Hempstead',
        latitude: 40.6850,
        longitude: -73.6523,
        branch: 'West Hempstead Branch',
    },
    {
        identifier: 'hempstead-gardens',
        name: 'Hempstead Gardens',
        latitude: 40.6907,
        longitude: -73.6655,
        branch: 'West Hempstead Branch',
    },
    {
        identifier: 'lakeview',
        name: 'Lakeview',
        latitude: 40.6847,
        longitude: -73.6547,
        branch: 'West Hempstead Branch',
    },
    {
        identifier: 'malverne',
        name: 'Malverne',
        latitude: 40.6747,
        longitude: -73.6697,
        branch: 'West Hempstead Branch',
    },
    {
        identifier: 'westwood',
        name: 'Westwood',
        latitude: 40.6682,
        longitude: -73.6792,
        branch: 'West Hempstead Branch',
    },

    // Port Jefferson Branch
    {
        identifier: 'syosset',
        name: 'Syosset',
        latitude: 40.8298,
        longitude: -73.5023,
        branch: 'Port Jefferson Branch',
    },
    {
        identifier: 'cold-spring-harbor',
        name: 'Cold Spring Harbor',
        latitude: 40.8585,
        longitude: -73.4574,
        branch: 'Port Jefferson Branch',
    },
    {
        identifier: 'huntington',
        name: 'Huntington',
        latitude: 40.8679,
        longitude: -73.4108,
        branch: 'Port Jefferson Branch',
    },
    {
        identifier: 'greenlawn',
        name: 'Greenlawn',
        latitude: 40.8670,
        longitude: -73.3660,
        branch: 'Port Jefferson Branch',
    },
    {
        identifier: 'northport',
        name: 'Northport',
        latitude: 40.8681,
        longitude: -73.3226,
        branch: 'Port Jefferson Branch',
    },
    {
        identifier: 'kings-park',
        name: 'Kings Park',
        latitude: 40.8872,
        longitude: -73.2572,
        branch: 'Port Jefferson Branch',
    },
    {
        identifier: 'smithtown',
        name: 'Smithtown',
        latitude: 40.8561,
        longitude: -73.2008,
        branch: 'Port Jefferson Branch',
    },
    {
        identifier: 'st-james',
        name: 'St. James',
        latitude: 40.8795,
        longitude: -73.1564,
        branch: 'Port Jefferson Branch',
    },
    {
        identifier: 'stony-brook',
        name: 'Stony Brook',
        latitude: 40.9108,
        longitude: -73.1304,
        branch: 'Port Jefferson Branch',
    },
    {
        identifier: 'port-jefferson',
        name: 'Port Jefferson',
        latitude: 40.9393,
        longitude: -73.0704,
        branch: 'Port Jefferson Branch',
    },

    // Oyster Bay Branch
    {
        identifier: 'jericho',
        name: 'Jericho',
        latitude: 40.7912,
        longitude: -73.5399,
        branch: 'Oyster Bay Branch',
    },
    {
        identifier: 'locust-valley',
        name: 'Locust Valley',
        latitude: 40.8756,
        longitude: -73.5965,
        branch: 'Oyster Bay Branch',
    },
    {
        identifier: 'glen-cove',
        name: 'Glen Cove',
        latitude: 40.8628,
        longitude: -73.6203,
        branch: 'Oyster Bay Branch',
    },
    {
        identifier: 'glen-street',
        name: 'Glen Street',
        latitude: 40.8575,
        longitude: -73.6292,
        branch: 'Oyster Bay Branch',
    },
    {
        identifier: 'sea-cliff',
        name: 'Sea Cliff',
        latitude: 40.8494,
        longitude: -73.6446,
        branch: 'Oyster Bay Branch',
    },
    {
        identifier: 'glen-head',
        name: 'Glen Head',
        latitude: 40.8352,
        longitude: -73.6259,
        branch: 'Oyster Bay Branch',
    },
    {
        identifier: 'greenvale',
        name: 'Greenvale',
        latitude: 40.8113,
        longitude: -73.6274,
        branch: 'Oyster Bay Branch',
    },
    {
        identifier: 'oyster-bay',
        name: 'Oyster Bay',
        latitude: 40.8676,
        longitude: -73.5321,
        branch: 'Oyster Bay Branch',
    },

    // Port Washington Branch
    {
        identifier: 'flushing-main-street',
        name: 'Flushing Main Street',
        latitude: 40.7570,
        longitude: -73.8302,
        branch: 'Port Washington Branch',
    },
    {
        identifier: 'murray-hill',
        name: 'Murray Hill',
        latitude: 40.7631,
        longitude: -73.8087,
        branch: 'Port Washington Branch',
    },
    {
        identifier: 'broadway',
        name: 'Broadway',
        latitude: 40.7622,
        longitude: -73.7992,
        branch: 'Port Washington Branch',
    },
    {
        identifier: 'auburndale',
        name: 'Auburndale',
        latitude: 40.7614,
        longitude: -73.7872,
        branch: 'Port Washington Branch',
    },
    {
        identifier: 'bayside',
        name: 'Bayside',
        latitude: 40.7635,
        longitude: -73.7695,
        branch: 'Port Washington Branch',
    },
    {
        identifier: 'douglaston',
        name: 'Douglaston',
        latitude: 40.7668,
        longitude: -73.7453,
        branch: 'Port Washington Branch',
    },
    {
        identifier: 'little-neck',
        name: 'Little Neck',
        latitude: 40.7743,
        longitude: -73.7320,
        branch: 'Port Washington Branch',
    },
    {
        identifier: 'great-neck',
        name: 'Great Neck',
        latitude: 40.7865,
        longitude: -73.7266,
        branch: 'Port Washington Branch',
    },
    {
        identifier: 'manhasset',
        name: 'Manhasset',
        latitude: 40.7975,
        longitude: -73.6997,
        branch: 'Port Washington Branch',
    },
    {
        identifier: 'plandome',
        name: 'Plandome',
        latitude: 40.8048,
        longitude: -73.6952,
        branch: 'Port Washington Branch',
    },
    {
        identifier: 'port-washington',
        name: 'Port Washington',
        latitude: 40.8295,
        longitude: -73.6904,
        branch: 'Port Washington Branch',
    },
];

/**
 * Get unique branch names from all stations.
 *
 * Returns:
 *     Array of unique branch names sorted alphabetically.
 */
export function getBranches() {
    const branches = [...new Set(LIRR_STATIONS.map((s) => s.branch))];
    return branches.sort();
}

/**
 * Get stations filtered by branch.
 *
 * Args:
 *     branch: Branch name to filter by.
 *
 * Returns:
 *     Array of stations on the specified branch.
 */
export function getStationsByBranch(branch) {
    return LIRR_STATIONS.filter((s) => s.branch === branch);
}

/**
 * Get stations formatted for geofencing registration.
 * On iOS, limits to 20 regions (major junctions + user selections).
 * On Android, returns all selected stations.
 *
 * Args:
 *     selectedIds: Array of user-selected station identifiers.
 *     radius: Geofence radius in meters.
 *
 * Returns:
 *     Array of station objects formatted for geofencing.
 */
export function getStationsForGeofencing(selectedIds, radius) {
    const platformStations = getStationsForPlatform(selectedIds);

    return platformStations.map((station) => ({
        identifier: station.identifier,
        latitude: station.latitude,
        longitude: station.longitude,
        radius,
        notifyOnEnter: true,
        notifyOnExit: true,
    }));
}

/**
 * Get stations based on platform limits.
 * iOS: Limited to 20 regions (major junctions always included).
 * Android: All selected stations.
 *
 * Args:
 *     selectedIds: Array of user-selected station identifiers.
 *
 * Returns:
 *     Array of station objects.
 */
export function getStationsForPlatform(selectedIds) {
    // Always include major junctions
    const majorStations = LIRR_STATIONS.filter((s) =>
        MAJOR_JUNCTIONS.includes(s.identifier)
    );

    // Get user-selected stations (excluding major junctions)
    const userSelectedStations = LIRR_STATIONS.filter(
        (s) =>
            selectedIds.includes(s.identifier) &&
            !MAJOR_JUNCTIONS.includes(s.identifier)
    );

    if (Platform.OS === 'ios') {
        // iOS limit: 20 regions total
        const remainingSlots = IOS_MAX_REGIONS - majorStations.length;
        const limitedUserStations = userSelectedStations.slice(
            0,
            remainingSlots
        );
        return [...majorStations, ...limitedUserStations];
    }

    // Android: return all selected + major junctions
    return [...majorStations, ...userSelectedStations];
}

/**
 * Find a station by its identifier.
 *
 * Args:
 *     identifier: Station identifier to find.
 *
 * Returns:
 *     Station object or undefined if not found.
 */
export function findStationById(identifier) {
    return LIRR_STATIONS.find((s) => s.identifier === identifier);
}

/**
 * Get the number of available slots for user selection on iOS.
 *
 * Returns:
 *     Number of slots available for user-selected stations.
 */
export function getAvailableSlots() {
    if (Platform.OS !== 'ios') {
        return LIRR_STATIONS.length - MAJOR_JUNCTION_COUNT;
    }
    return IOS_MAX_REGIONS - MAJOR_JUNCTION_COUNT;
}
