# Установка окружения: React + Laravel + SQLite на М ОС

Пошаговый гайд по установке всего, что нужно для проекта (фронтенд на **React**, бэкенд на **Laravel**, база **SQLite**, по желанию **MySQL/MariaDB**) на **М ОС** — дистрибутиве Linux, сделанном на пакетной базе **Альт Линукс**.

> **Важно про М ОС.** Это не Ubuntu и не Debian. Пакеты ставятся через `apt-get`, но **названия пакетов свои** (например, `php8.3-mbstring`, а не `php-mbstring`). Команды из гайдов для Ubuntu часто не сработают. Если сомневаешься в имени пакета — ищи его через `apt-cache search`.

---

## Содержание

0. [Что будет установлено](#0-что-будет-установлено)
1. [Подготовка: права root и обновление системы](#1-подготовка-права-root-и-обновление-системы)
2. [Git](#2-git)
3. [PHP](#3-php)
4. [Composer](#4-composer)
5. [Laravel](#5-laravel)
6. [SQLite (и MySQL/MariaDB по желанию)](#6-sqlite-и-mysqlmariadb-по-желанию)
7. [Node.js и npm](#7-nodejs-и-npm)
8. [React](#8-react)
9. [Связка React + Laravel](#9-связка-react--laravel)
10. [GitHub: настройка доступа](#10-github-настройка-доступа)
11. [Финальная проверка](#11-финальная-проверка)
12. [Ошибки и их решения](#12-ошибки-и-их-решения)

---

## 0. Что будет установлено

| Компонент | Зачем | Минимальная версия |
|---|---|---|
| Git | Работа с репозиторием | любая свежая |
| PHP + расширения | Язык, на котором работает Laravel | **8.3** (Laravel 12 работает и на 8.2) |
| Composer | Менеджер пакетов PHP, ставит Laravel | 2.x |
| Laravel | Бэкенд, API, работа с базой | 12+ |
| SQLite | Файловая база данных (по умолчанию в Laravel) | 3.x |
| Node.js + npm | Нужны для React и сборщика Vite | **20.19+** или **22+** |
| React | Фронтенд | 18+ |

> **Laravel — это не база данных.** Это PHP-фреймворк для бэкенда. Сама база — SQLite (один файл на диске, ничего запускать не надо). «MySQL lite» — скорее всего, имеется в виду именно SQLite.

---

## 1. Подготовка: права root и обновление системы

### 1.1. Получить права root

Для установки пакетов нужны права администратора. В Альт-системах обычно используется `su`, а `sudo` по умолчанию может быть не настроен.

**Способ А — через `su` (основной):**
```bash
su -
# вводишь пароль root
```
Приглашение сменится на `#` — значит, ты root. Выйти обратно: `exit`.

**Способ Б — через `sudo` (если настроен):**
```bash
sudo -i
```

**Способ В — включить sudo для своего пользователя** (делается один раз от root):
```bash
su -
apt-get install sudo
control sudowheel enabled
usermod -aG wheel ИМЯ_ПОЛЬЗОВАТЕЛЯ
exit
```
После этого перезайди в систему (выйди из сеанса и войди заново).

> Если пароля root у тебя нет (школьный или рабочий компьютер) — шаги с установкой пакетов не получатся. Нужно обратиться к администратору или использовать способы «без root», которые отмечены ниже.

### 1.2. Обновить систему

```bash
apt-get update
apt-get dist-upgrade
```

### 1.3. Базовые утилиты

```bash
apt-get install git curl wget unzip ca-certificates
```

Проверка:
```bash
git --version
curl --version
```

---

## 2. Git

Обычно уже установлен на шаге 1.3. Если нет:
```bash
apt-get install git
```

Настрой имя и почту (от **обычного** пользователя, не root):
```bash
git config --global user.name "Твоё Имя"
git config --global user.email "твоя@почта"
git config --global init.defaultBranch main
```

---

## 3. PHP

### 3.1. Узнать, какие версии PHP есть в репозитории

```bash
apt-cache search ^php8 | grep -E "^php8\.[0-9]+ "
```
Выбирай **самую новую из 8.3, 8.4** (если есть). Ниже везде используется `8.3` — если у тебя другая версия, просто замени цифры.

### 3.2. Способ А — установка из репозитория (рекомендуется)

```bash
apt-get install php8.3 php8.3-mbstring php8.3-pdo php8.3-pdo_sqlite \
  php8.3-curl php8.3-zip php8.3-fileinfo php8.3-intl php8.3-xmlreader
```

Если нужен MySQL/MariaDB, добавь:
```bash
apt-get install php8.3-pdo_mysql php8.3-mysqlnd-mysqli
```

> В Альте отдельного пакета `php8.3-openssl` нет — OpenSSL уже встроен в основной пакет. Пакетов `php8.3-xml`, `php8.3-dom`, `php8.3-ctype`, `php8.3-tokenizer` тоже может не быть: они часто встроены в `php8.3`. Это нормально. Проверяем ниже.

### 3.3. Способ Б — найти пакеты самостоятельно

Если какой-то пакет из списка не нашёлся:
```bash
apt-cache search php8.3 | sort
```
и ставь то, что есть с нужным словом в названии (`mbstring`, `sqlite`, `curl`, `zip`, `xml`).

### 3.4. Проверка PHP

```bash
php -v
php -m
```

В списке `php -m` должны быть (обязательно для Laravel):

```
ctype  curl  dom  fileinfo  filter  hash  mbstring  openssl
pcre  PDO  pdo_sqlite  session  tokenizer  xml
```

Быстрая проверка нужных модулей одной командой:
```bash
for m in ctype curl dom fileinfo filter hash mbstring openssl pcre PDO pdo_sqlite session tokenizer xml zip; do
  php -m | grep -qix "$m" && echo "OK      $m" || echo "НЕТ     $m"
done
```
Всё, что помечено `НЕТ`, ищи через `apt-cache search php8.3 | grep ИМЯ` и доустанавливай.

### 3.5. Если команда `php` не находится, а `php8.3` есть

```bash
ls /usr/bin/php*
```
Если есть только `/usr/bin/php8.3`, сделай ссылку:
```bash
ln -s /usr/bin/php8.3 /usr/local/bin/php
```

---

## 4. Composer

Composer — менеджер пакетов PHP. Через него ставится сам Laravel и все его зависимости.

### 4.1. Способ А — официальный установщик (рекомендуется)

От **root**:
```bash
cd /tmp
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
php -r "unlink('composer-setup.php');"
```

> Официальная страница с проверкой контрольной суммы установщика: https://getcomposer.org/download/ — можно взять команды оттуда, там есть строка с проверкой hash.

### 4.2. Способ Б — из репозитория Альта

```bash
apt-cache search composer
apt-get install composer
```
Версия в репозитории может быть старше, но для Laravel подойдёт любая **2.x**.

### 4.3. Способ В — без root (только для своего пользователя)

```bash
mkdir -p ~/.local/bin
cd ~/.local/bin
curl -sS https://getcomposer.org/installer | php -- --filename=composer
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### 4.4. Проверка

```bash
composer -V
composer diagnose
```
`composer diagnose` покажет проблемы с сетью, SSL и расширениями PHP.

---

## 5. Laravel

Дальше всё делается от **обычного пользователя** (не root!), иначе потом будут проблемы с правами на файлы.

### 5.1. Способ А — через Laravel Installer (рекомендуется)

```bash
composer global require laravel/installer
```

Добавить Composer-утилиты в PATH. Сначала узнай правильный путь:
```bash
composer global config bin-dir --absolute
```
Обычно это `~/.config/composer/vendor/bin` или `~/.composer/vendor/bin`. Пропиши его:
```bash
echo 'export PATH="$HOME/.config/composer/vendor/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
laravel --version
```

Создать проект:
```bash
laravel new backend
```
Установщик задаст вопросы:
- **Starter kit** — `None` (если React будет отдельно) или `React` (если React внутри Laravel, см. раздел 9).
- **Database** — `SQLite`.
- **Run migrations** — `Yes`.

### 5.2. Способ Б — через Composer напрямую (если installer не ставится)

```bash
composer create-project laravel/laravel backend
cd backend
```
SQLite уже выбрана по умолчанию в `.env`. Если файла базы нет:
```bash
touch database/database.sqlite
php artisan migrate
```

### 5.3. Запуск

```bash
cd backend
php artisan serve
```
Открой в браузере http://127.0.0.1:8000 — должна появиться стартовая страница Laravel.

Если нужен доступ с другого компьютера в сети:
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

---

## 6. SQLite (и MySQL/MariaDB по желанию)

### 6.1. SQLite (по умолчанию)

Для работы Laravel достаточно PHP-расширения `pdo_sqlite` (шаг 3). Консольная утилита нужна, чтобы смотреть базу руками:
```bash
apt-get install sqlite3
sqlite3 --version
```

Настройки в файле `backend/.env`:
```env
DB_CONNECTION=sqlite
# DB_DATABASE можно не указывать — по умолчанию database/database.sqlite
```

Посмотреть таблицы:
```bash
sqlite3 database/database.sqlite ".tables"
```

Графический просмотрщик (по желанию):
```bash
apt-cache search sqlitebrowser
apt-get install sqlitebrowser
```

### 6.2. MySQL / MariaDB (если в ТЗ требуется именно MySQL)

В Альте вместо MySQL обычно используется полностью совместимая **MariaDB**.

От root:
```bash
apt-get install mariadb-server mariadb-client
systemctl enable --now mariadb
```

Создать базу и пользователя:
```bash
mysql -u root
```
```sql
CREATE DATABASE app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'app'@'localhost' IDENTIFIED BY 'придумай_пароль';
GRANT ALL PRIVILEGES ON app.* TO 'app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

В `backend/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=app
DB_USERNAME=app
DB_PASSWORD=придумай_пароль
```
Затем:
```bash
php artisan migrate
```

> Пароли из `.env` **никогда** не заливай на GitHub. Файл `.env` в Laravel уже добавлен в `.gitignore` — проверь, что так и осталось.

---

## 7. Node.js и npm

React и сборщик Vite требуют **Node.js 20.19+ или 22+**.

### 7.1. Способ А — через nvm (рекомендуется, без root)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
nvm alias default 'lts/*'
```

Плюсы: свежая версия, не нужен root, легко переключать версии (`nvm install 22`, `nvm use 22`).

### 7.2. Способ Б — из репозитория Альта

От root:
```bash
apt-cache search ^node | head -30
apt-get install node npm
```
**Обязательно проверь версию** (`node -v`). Если она ниже 20.19 — используй способ А или В.

### 7.3. Способ В — готовый архив с nodejs.org (если GitHub заблокирован и nvm не ставится)

1. Скачай с https://nodejs.org/en/download архив **Linux x64 (.tar.xz)** версии LTS.
2. Распакуй к себе в домашнюю папку:
```bash
mkdir -p ~/.local/node
tar -xJf ~/Загрузки/node-v*-linux-x64.tar.xz -C ~/.local/node --strip-components=1
echo 'export PATH="$HOME/.local/node/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### 7.4. Проверка

```bash
node -v
npm -v
```

---

## 8. React

### 8.1. Способ А — отдельный проект через Vite (рекомендуется)

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm run dev
```
Открой http://localhost:5173.

Для TypeScript: `--template react-ts`.

### 8.2. Способ Б — React внутри Laravel (стартовый набор)

При создании проекта выбери starter kit **React**:
```bash
laravel new app   # Starter kit: React, Database: SQLite
cd app
npm install
composer run dev   # запускает и Laravel, и Vite одновременно
```
Открой http://127.0.0.1:8000.

### 8.3. Какой способ выбрать

| | Отдельно (Vite) | Внутри Laravel |
|---|---|---|
| Структура | две папки: `frontend/` и `backend/` | одна папка |
| Связь с бэкендом | через API (`fetch`/`axios`) | через Inertia, без отдельного API |
| Когда брать | если в ТЗ нужен API или отдельный фронт | если проще и быстрее, без отдельного API |

---

## 9. Связка React + Laravel

Если фронт и бэк — отдельные проекты (способ 8.1), фронтенд будет обращаться к API Laravel.

**В Laravel** включить маршруты API (в Laravel 11+ они не включены по умолчанию):
```bash
cd backend
php artisan install:api
```
Маршруты пишутся в `routes/api.php` и доступны по адресу `http://127.0.0.1:8000/api/...`.

**Во фронтенде** проще всего настроить прокси в `frontend/vite.config.js`, тогда не будет проблем с CORS:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
```
И в коде React обращаться просто к `/api/...`:
```js
fetch('/api/items').then(r => r.json())
```

Запуск в двух терминалах:
```bash
# терминал 1
cd backend && php artisan serve
# терминал 2
cd frontend && npm run dev
```

---

## 10. GitHub: настройка доступа

GitHub больше не принимает пароль от аккаунта при `git push`. Нужен один из способов:

### Способ А — SSH-ключ (рекомендуется)

```bash
ssh-keygen -t ed25519 -C "твоя@почта"
# Enter на все вопросы
cat ~/.ssh/id_ed25519.pub
```
Скопируй вывод и добавь его на GitHub: **Settings → SSH and GPG keys → New SSH key**.

Проверка:
```bash
ssh -T git@github.com
```
Клонирование по SSH:
```bash
git clone git@github.com:Sairoom/demo.git
```

### Способ Б — токен (Personal Access Token)

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Дай доступ к репозиторию `demo` с правом **Contents: Read and write**.
3. При `git push` вместо пароля вставляй токен.

Чтобы не вводить каждый раз:
```bash
git config --global credential.helper store
```
> Токен будет храниться в `~/.git-credentials` открытым текстом. На общем компьютере лучше использовать SSH.

### Способ В — GitHub CLI

```bash
apt-cache search gh
apt-get install gh   # если есть в репозитории
gh auth login
```

---

## 11. Финальная проверка

Выполни всё подряд — каждая строка должна вывести версию без ошибок:

```bash
git --version
php -v                  # 8.3+ (или 8.2+ для Laravel 12)
php -m | grep -i sqlite # pdo_sqlite
composer -V             # 2.x
laravel --version       # если ставил installer
sqlite3 --version
node -v                 # 20.19+ или 22+
npm -v
```

---

## 12. Ошибки и их решения

### Установка пакетов

| Ошибка | Причина | Решение |
|---|---|---|
| `su: Authentication failure` | Неверный пароль root или root отключён | Проверь раскладку. Если пароля нет — к администратору, либо используй способы «без root» (Composer 4.3, Node через nvm 7.1) |
| `E: Couldn't find package php8.3-...` / `Не удалось найти пакет` | В твоей версии М ОС пакет называется иначе или такой версии PHP нет | `apt-cache search php8 \| sort` — посмотри доступные версии и названия, замени цифры в командах |
| `E: Ошибка при получении ...` во время `apt-get update` | Нет интернета или недоступно зеркало репозитория | Проверь сеть (`ping 8.8.8.8`), список репозиториев: `apt-repo list` |
| `apt-get` ругается на зависимости / битые пакеты | Система не обновлена | `apt-get update && apt-get dist-upgrade`, затем `apt-get -f install` |
| `Could not get lock /var/lib/...` | Другая установка ещё идёт (например, центр обновлений) | Дождись окончания или закрой графический менеджер пакетов |

### PHP и Composer

| Ошибка | Причина | Решение |
|---|---|---|
| `php: command not found` | PHP не установлен или бинарник называется `php8.3` | Раздел 3.5 — сделать ссылку |
| `Your PHP version (8.1.x) does not satisfy that requirement` | Старый PHP | Поставь более новую версию PHP (раздел 3.1) |
| `requires ext-dom / ext-xml / ext-mbstring ... missing` | Не хватает расширения PHP | `apt-cache search php8.3 \| grep ИМЯ`, установить, проверить `php -m` |
| `could not find driver (Connection: sqlite)` | Нет расширения `pdo_sqlite` | `apt-get install php8.3-pdo php8.3-pdo_sqlite` |
| `could not find driver (Connection: mysql)` | Нет `pdo_mysql` | `apt-get install php8.3-pdo_mysql` |
| `The openssl extension is required for SSL/TLS protection` | PHP собран без OpenSSL или он отключён | Проверь `php -m \| grep openssl`, обнови пакет `php8.3` |
| `curl error 60: SSL certificate problem` | Нет корневых сертификатов или сбиты часы | `apt-get install ca-certificates`, проверь дату: `date` |
| `Allowed memory size of ... exhausted` при `composer install` | Не хватает памяти PHP | `COMPOSER_MEMORY_LIMIT=-1 composer install` |
| `composer` очень долго качает / таймауты | Медленная сеть или блокировки | `composer config -g process-timeout 2000`; при работе через прокси задай `export HTTPS_PROXY=http://адрес:порт` |
| `laravel: command not found` | Папка Composer не в PATH | `composer global config bin-dir --absolute` → добавь путь в `~/.bashrc` (раздел 5.1) |
| Composer под root: `Do not run Composer as root/super user!` | Запуск от root | Выйди из root (`exit`) и запусти от своего пользователя |

### Laravel

| Ошибка | Причина | Решение |
|---|---|---|
| `Database file at path [.../database.sqlite] does not exist` | Нет файла базы | `touch database/database.sqlite` и `php artisan migrate` |
| `attempt to write a readonly database` | Нет прав на файл базы или папку | `chmod 664 database/database.sqlite && chmod 775 database` |
| `No application encryption key has been specified` | Не создан ключ | `php artisan key:generate` |
| `.env` не найден | Проект склонирован с GitHub без `.env` | `cp .env.example .env && php artisan key:generate` |
| `The stream or file "storage/logs/laravel.log" could not be opened` | Нет прав на запись | `chmod -R 775 storage bootstrap/cache` |
| `Class "..." not found` после `git pull` | Не установлены/обновлены зависимости | `composer install && composer dump-autoload` |
| `Failed to listen on 127.0.0.1:8000 (Address already in use)` | Порт занят | `php artisan serve --port=8001` или найди процесс: `ss -ltnp \| grep 8000` |
| Белая страница / ошибка 500 | Ошибка в коде или настройках | Включи `APP_DEBUG=true` в `.env`, смотри `storage/logs/laravel.log` |
| `Route [api/...] not defined` / 404 на `/api` | Не включены маршруты API | `php artisan install:api` |
| `SQLSTATE[HY000] [1045] Access denied for user` (MariaDB) | Неверный логин/пароль в `.env` или пользователь не создан | Проверь `.env`, пересоздай пользователя (раздел 6.2), затем `php artisan config:clear` |
| `SQLSTATE[HY000] [2002] Connection refused` (MariaDB) | Сервер БД не запущен | `systemctl start mariadb`, `systemctl status mariadb` |

### Node.js и React

| Ошибка | Причина | Решение |
|---|---|---|
| `nvm: command not found` | Не перечитан `~/.bashrc` | `source ~/.bashrc` или открой новый терминал |
| `curl: (7) Failed to connect to raw.githubusercontent.com` | GitHub недоступен из сети | Способ В из раздела 7 (архив с nodejs.org) или Node из репозитория |
| `Vite requires Node.js version 20.19+ or 22.12+` | Старый Node | `nvm install --lts` или `nvm install 22` |
| `npm ERR! code EACCES` | npm ставит глобальные пакеты в системную папку | Не используй `sudo npm`. Поставь Node через nvm (7.1) |
| `npm ERR! network` / `ETIMEDOUT` | Проблемы с сетью или прокси | `npm config set proxy http://адрес:порт` и `npm config set https-proxy http://адрес:порт`; повтори `npm install` |
| `ENOSPC: System limit for number of file watchers reached` | Лимит наблюдения за файлами | От root: `echo fs.inotify.max_user_watches=524288 >> /etc/sysctl.conf && sysctl -p` |
| Сайт на `:5173` не открывается с другого устройства | Vite слушает только localhost | `npm run dev -- --host` |
| `CORS policy: No 'Access-Control-Allow-Origin'` | Фронт обращается к API на другом порту напрямую | Настрой прокси в Vite (раздел 9) или `php artisan config:publish cors` и пропиши адрес фронта в `config/cors.php` |
| `Cannot find module ...` после `git pull` | Не установлены зависимости | `npm install` |

### Git и GitHub

| Ошибка | Причина | Решение |
|---|---|---|
| `Support for password authentication was removed` | GitHub не принимает пароль | Используй SSH-ключ или токен (раздел 10) |
| `Permission denied (publickey)` | SSH-ключ не добавлен на GitHub | Добавь содержимое `~/.ssh/id_ed25519.pub` в настройки GitHub, проверь `ssh -T git@github.com` |
| `! [rejected] main -> main (fetch first)` | На GitHub есть коммиты, которых нет у тебя | `git pull --rebase origin main`, затем `git push` |
| `Author identity unknown` | Не настроены имя и почта | Раздел 2 — `git config --global user.name/user.email` |
| Случайно закоммитил `.env` с паролями | `.env` не был в `.gitignore` | `git rm --cached .env`, добавь `.env` в `.gitignore`, закоммить и **смени пароли** |

---

## Если ничего не помогло

1. Скопируй **полный текст ошибки** (не скриншот, а текст).
2. Укажи, на каком шаге она появилась и какую команду ты вводил.
3. Приложи вывод команд:
   ```bash
   cat /etc/os-release
   php -v; php -m
   composer -V
   node -v; npm -v
   ```
