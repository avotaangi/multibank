import { useState, useEffect } from 'react';
import { getTelegramWebApp } from '../utils/telegram';

export const useTelegramUser = () => {
  const [userInfo, setUserInfo] = useState({
    firstName: 'Евгений',
    lastName: 'Богатов',
    username: 'evgeny_bogatov',
    displayName: 'Евгений Богатов'
  });

  useEffect(() => {
    const webApp = getTelegramWebApp();
    if (webApp && webApp.initDataUnsafe && webApp.initDataUnsafe.user) {
      const user = webApp.initDataUnsafe.user;
      const firstName = user.first_name || 'Пользователь';
      const lastName = user.last_name || '';
      const username = user.username || '';
      
      // Формируем отображаемое имя
      let displayName = firstName;
      if (lastName) {
        displayName += ` ${lastName}`;
      } else if (username) {
        displayName = `@${username}`;
      }
      
      setUserInfo({
        firstName,
        lastName,
        username,
        displayName
      });
      
      console.log('Telegram user info:', { firstName, lastName, username, displayName });
    } else {
      console.log('Telegram user info not available, using default');
    }
  }, []);

  return userInfo;
};
