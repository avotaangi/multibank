import { useState, useEffect } from 'react';
import { getTelegramWebApp } from '../utils/telegram';

export const useTelegramUser = () => {
  const [userInfo, setUserInfo] = useState({
    firstName: 'Евгений',
    lastName: 'Богатов',
    username: 'evgeny_bogatov',
    displayName: 'Евгений Богатов',
    shortName: 'Евгений Б.',
    photoUrl: ''
  });

  useEffect(() => {
    const webApp = getTelegramWebApp();
    if (webApp && webApp.initDataUnsafe && webApp.initDataUnsafe.user) {
      const user = webApp.initDataUnsafe.user;
      const firstName = user.first_name || 'Пользователь';
      const lastName = user.last_name || '';
      const username = user.username || '';
      const photoUrl = '';
      
      // Формируем отображаемое имя
      let displayName = firstName;
      if (lastName) {
        displayName += ` ${lastName}`;
      } else if (username) {
        displayName = `@${username}`;
      }
      
      // Формируем короткое имя (первая буква имени + первая буква фамилии)
      let shortName = firstName.charAt(0);
      if (lastName) {
        shortName += `. ${lastName.charAt(0)}.`;
      } else if (username) {
        shortName = `@${username}`;
      } else {
        shortName = firstName;
      }
      
      // Используем requestAnimationFrame для гарантии, что обновление произойдет после рендеринга
      requestAnimationFrame(() => {
        setUserInfo({
          firstName,
          lastName,
          username,
          displayName,
          shortName,
          photoUrl
        });
      });
    }
  }, []);

  return userInfo;
};
