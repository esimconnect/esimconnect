// src/components/LanguageToggle.js
import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../lib/i18n';
import styles from './LanguageToggle.module.css';

export default function LanguageToggle() {
  const { lang, setLang, LANGUAGES } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function select(code) {
    setLang(code);
    setOpen(false);
  }

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
      >
        <span className={styles.flag}>{current.flag}</span>
        <span className={styles.label}>{current.label}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <ul className={styles.dropdown} role="listbox">
          {LANGUAGES.map(l => (
            <li
              key={l.code}
              role="option"
              aria-selected={l.code === lang}
              className={`${styles.option} ${l.code === lang ? styles.active : ''}`}
              onClick={() => select(l.code)}
            >
              <span className={styles.flag}>{l.flag}</span>
              <span className={styles.optionLabel}>{l.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
