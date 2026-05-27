export type AccountType = 'deaf' | 'blind' | 'non-verbal';

export interface UserProfile {
    // 'disabilities': Set<'deaf' | 'blind' | 'non-verbal'>, for future multi-disabilities versions
    'disabilities': 'deaf' | 'blind' | 'non-verbal',
    'timings': {
        // all values are in ms
        'perSymbol': number,
        'perLetter': number,
        'perWord': number
    }
}