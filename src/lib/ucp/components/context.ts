import { createContext } from 'svelte';

/**
 * This context is used to store the quote depth of a message.
 */
export const [getQuoteDepth, setQuoteDepth] = createContext<number>();
