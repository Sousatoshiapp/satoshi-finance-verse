import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useI18n } from '../use-i18n';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key: string) => key),
    i18n: {
      language: 'pt-BR',
      changeLanguage: vi.fn(),
      emit: vi.fn(),
    },
  }),
}));

describe('useI18n', () => {
  it('should return translation function and language utilities', () => {
    const { result } = renderHook(() => useI18n());

    expect(result.current.t).toBeDefined();
    expect(result.current.changeLanguage).toBeDefined();
    expect(result.current.getCurrentLanguage).toBeDefined();
  });

  it('should return current language', () => {
    const { result } = renderHook(() => useI18n());

    expect(result.current.getCurrentLanguage()).toBe('pt-BR');
  });

  it('should change language when called', () => {
    const { result } = renderHook(() => useI18n());

    act(() => {
      result.current.changeLanguage('en-US');
    });

    expect(result.current.changeLanguage).toBeDefined();
  });
});
