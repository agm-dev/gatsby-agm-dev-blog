// @flow strict
import React from 'react';
import { getContactHref, getIcon } from '../../../utils';
import Icon from '../../Icon';
import styles from './Contacts.module.scss';

type Props = {
  contacts: {
    [string]: string,
  },
};

const Contacts = ({ contacts }: Props) => (
  <div className={styles['contacts']}>
    <ul className={styles['contacts__list']}>
      {contacts.map(({ type, value }) => (
        <li className={styles['contacts__list-item']} key={type}>
          <a
            className={styles['contacts__list-item-link']}
            href={getContactHref(type, value)}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon name={type} icon={getIcon(type)} />
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default Contacts;
