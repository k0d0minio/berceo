/**
 * The profile's lengths, in one module both the database schema and the form
 * read, so the check constraint and the form's rule cannot drift apart.
 */

/** The longest context line a family may write about itself (D-20: no health data). */
export const CONTEXT_MAX = 300;
export const STREET_MAX = 120;
export const NUMBER_MAX = 10;
export const BOX_MAX = 10;
