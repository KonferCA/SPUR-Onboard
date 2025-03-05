import { describe, expect, it } from 'vitest';
import { sanitizeHtmlId } from '@/utils/html';

describe('HTML ID Satinatzion', () => {
    it('should sanitize id with space', () => {
        const id = 'Hello World!';
        expect(sanitizeHtmlId(id)).toEqual('hello-world');
    });

    it('should sanitize id starting with numbers', () => {
        const id = '123ABC';
        expect(sanitizeHtmlId(id)).toEqual('id-123abc');
    });

    it('should sanitize id with invalid characters', () => {
        const id = 'My@Fancy#ID';
        expect(sanitizeHtmlId(id)).toEqual('myfancyid');
    });

    it('should return empty string if given empty id', () => {
        const id = '';
        expect(sanitizeHtmlId(id)).toEqual('');
    });
});
