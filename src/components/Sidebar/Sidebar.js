// @flow strict
import React from 'react';
import Author from './Author';
import Contacts from './Contacts';
import Copyright from './Copyright';
import Menu from './Menu';
import styles from './Sidebar.module.scss';
import { useSiteMetadata } from '../../hooks';

type Props = {
  isIndex?: boolean,
};

const CONTACTS_ORDER = [
  'telegram',
  'twitter',
  'github',
  'instagram',
  'linkedin',
  'email',
  'facebook',
  'rss',
  'vkontakte',
  'line',
  'gitlab',
  'weibo'
]

const sortContacts = contacts => CONTACTS_ORDER
  .filter(target => !!contacts[target])
  .map(target => ({
    type: target,
    value: contacts[target]
  }))

const Sidebar = ({ isIndex }: Props) => {
  const { author, copyright, menu } = useSiteMetadata();

  return (
    <div className={styles['sidebar']}>
      <div className={styles['sidebar__inner']}>
        <Author author={author} isIndex={isIndex} />
        <Menu menu={menu} />
        <Contacts contacts={sortContacts(author.contacts)} />
        <Copyright copyright={copyright} />
      </div>
    </div>
  );
};

export default Sidebar;
