<?php
declare(strict_types=1);

ini_set('session.use_strict_mode', '1');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/../PAGINA/db/conexion.php';

$adminUser = getenv('ADMIN_USER') ?: 'admin';
$adminPassword = getenv('ADMIN_PASSWORD') ?: 'Admin123!';
$error = '';

function admin_csrf_token(): string
{
    if (empty($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function admin_verify_csrf(string $token): bool
{
    return isset($_SESSION['csrf_token']) && is_string($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'logout') {
    if (admin_verify_csrf((string) ($_POST['csrf_token'] ?? ''))) {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
    }

    header('Location: /admin/');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $csrfToken = (string) ($_POST['csrf_token'] ?? '');
    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if (!admin_verify_csrf($csrfToken)) {
        $error = 'La sesión expiró. Recarga la página e intenta de nuevo.';
    } elseif ($username === $adminUser && hash_equals($adminPassword, $password)) {
        session_regenerate_id(true);
        $_SESSION['admin_logged_in'] = true;
        header('Location: /admin/');
        exit;
    } else {
        $error = 'Credenciales incorrectas.';
    }
}

if (!empty($_SESSION['admin_logged_in']) && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete') {
    $csrfToken = (string) ($_POST['csrf_token'] ?? '');
    $id = (int) ($_POST['id'] ?? 0);

    if (!admin_verify_csrf($csrfToken)) {
        $error = 'La sesión expiró. Recarga la página e intenta de nuevo.';
    } elseif ($id > 0) {
        try {
            $db = nicasalud_db_connection();
            $statement = $db->prepare('DELETE FROM contactos WHERE id = ?');
            if ($statement) {
                $statement->bind_param('i', $id);
                $statement->execute();
                $statement->close();
            }
            $db->close();
        } catch (Throwable $errorDelete) {
            $error = 'No se pudo eliminar el mensaje seleccionado.';
        }
    }

    header('Location: /admin/');
    exit;
}

$messages = [];
$stats = [
    'total' => 0,
    'today' => 0,
    'last' => null,
];
$csrfToken = admin_csrf_token();

if (!empty($_SESSION['admin_logged_in'])) {
    try {
        $db = nicasalud_db_connection();

        $messagesResult = $db->query(
            'SELECT id, nombre, correo, mensaje, pagina_origen, ip_origen, user_agent, created_at
             FROM contactos
             ORDER BY created_at DESC, id DESC'
        );

        if ($messagesResult instanceof mysqli_result) {
            while ($row = $messagesResult->fetch_assoc()) {
                $messages[] = $row;
            }
            $messagesResult->free();
        }

        $stats['total'] = count($messages);
        foreach ($messages as $message) {
            if (($message['created_at'] ?? '') !== '' && str_starts_with((string) $message['created_at'], date('Y-m-d'))) {
                $stats['today']++;
            }
        }

        $stats['last'] = $messages[0] ?? null;

        $db->close();
    } catch (Throwable $errorDb) {
        $error = 'No se pudo leer la base de datos. Revisa MySQL y la conexion.';
    }
}

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function excerpt(string $value, int $limit = 120): string
{
    $value = trim($value);
    $length = function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);

    if ($length <= $limit) {
        return $value;
    }

    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $limit - 1) . '...';
    }

    return substr($value, 0, $limit - 1) . '...';
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin | NicaSalud</title>
    <link rel="icon" type="image/png" href="/assets/favicon.png?v=2">
    <style>
        :root {
            color-scheme: dark;
            --bg: #06161d;
            --panel: rgba(10, 32, 40, 0.9);
            --panel-strong: #0f2b35;
            --line: rgba(111, 231, 181, 0.16);
            --text: #e9fbf7;
            --muted: #a8c8c9;
            --accent: #31d8d2;
            --accent-2: #67a7ff;
            --good: #5fe2a6;
            --bad: #f26f63;
            --shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: "Segoe UI", Arial, sans-serif;
            background:
                radial-gradient(circle at top left, rgba(95, 226, 166, 0.14), transparent 30rem),
                radial-gradient(circle at top right, rgba(103, 167, 255, 0.16), transparent 28rem),
                linear-gradient(180deg, #071c24, #06161d 48rem);
            color: var(--text);
        }
        a { color: inherit; text-decoration: none; }
        .shell {
            width: min(1280px, calc(100% - 2rem));
            margin: 0 auto;
            padding: 2rem 0 3rem;
        }
        .hero {
            display: grid;
            gap: 1rem;
            padding: 1.35rem;
            border: 1px solid var(--line);
            border-radius: 1.5rem;
            background: linear-gradient(135deg, rgba(10, 32, 40, 0.94), rgba(10, 32, 40, 0.7));
            box-shadow: var(--shadow);
        }
        .topline {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 0.85rem;
            font-weight: 800;
            letter-spacing: -0.02em;
        }
        .brand img {
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            object-fit: cover;
        }
        .actions {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
        .actions form {
            margin: 0;
        }
        .button, .ghost {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 2.75rem;
            padding: 0.7rem 1rem;
            border-radius: 0.85rem;
            border: 0;
            font: inherit;
            font-weight: 800;
            cursor: pointer;
        }
        .button {
            background: linear-gradient(135deg, var(--accent), var(--accent-2));
            color: #fff;
        }
        .ghost {
            background: rgba(255, 255, 255, 0.08);
            color: var(--text);
            border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1rem;
        }
        .stat {
            padding: 1rem;
            border-radius: 1rem;
            background: var(--panel);
            border: 1px solid var(--line);
        }
        .stat span {
            display: block;
            color: var(--muted);
            font-size: 0.9rem;
        }
        .stat strong {
            display: block;
            margin-top: 0.45rem;
            font-size: clamp(1.7rem, 3vw, 2.5rem);
        }
        .login, .panel {
            margin-top: 1.25rem;
            padding: 1.35rem;
            border-radius: 1.35rem;
            border: 1px solid var(--line);
            background: rgba(10, 32, 40, 0.85);
            box-shadow: var(--shadow);
        }
        .login-grid {
            display: grid;
            gap: 0.85rem;
            max-width: 28rem;
        }
        label {
            display: grid;
            gap: 0.4rem;
            font-weight: 700;
        }
        input {
            min-height: 2.85rem;
            padding: 0.75rem 0.9rem;
            border-radius: 0.8rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: #0b222b;
            color: var(--text);
            font: inherit;
        }
        input:focus {
            outline: 2px solid rgba(49, 216, 210, 0.3);
            border-color: rgba(49, 216, 210, 0.4);
        }
        .message {
            margin: 0;
            color: var(--muted);
        }
        .message.error {
            color: #ffb6ad;
        }
        .message.good {
            color: #bff7ea;
        }
        .toolbar {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 1rem;
            align-items: center;
            margin-bottom: 1rem;
        }
        .searchbox {
            width: 100%;
            max-width: 30rem;
        }
        .table-wrap {
            overflow: auto;
            border-radius: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        table {
            width: 100%;
            border-collapse: collapse;
            min-width: 980px;
            background: #081d25;
        }
        thead th {
            position: sticky;
            top: 0;
            background: #0f2b35;
            color: #dffcf0;
            text-align: left;
            font-size: 0.88rem;
            letter-spacing: 0.02em;
        }
        th, td {
            padding: 0.85rem 0.9rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
            vertical-align: top;
        }
        tbody tr:hover {
            background: rgba(95, 226, 166, 0.05);
        }
        .pill {
            display: inline-flex;
            align-items: center;
            padding: 0.34rem 0.65rem;
            border-radius: 999px;
            background: rgba(95, 226, 166, 0.12);
            color: #c8f9e1;
            font-size: 0.82rem;
            font-weight: 700;
        }
        .muted { color: var(--muted); }
        .delete-btn {
            border: 0;
            border-radius: 0.75rem;
            padding: 0.55rem 0.8rem;
            background: rgba(242, 111, 99, 0.15);
            color: #ffccc6;
            font: inherit;
            font-weight: 800;
            cursor: pointer;
        }
        .delete-btn:hover {
            background: rgba(242, 111, 99, 0.25);
        }
        .empty {
            padding: 2rem;
            text-align: center;
            color: var(--muted);
        }
        .login-note {
            margin-top: 0.8rem;
            color: var(--muted);
            font-size: 0.95rem;
        }
        @media (max-width: 900px) {
            .stats, .toolbar {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="shell">
        <section class="hero">
            <div class="topline">
                <div class="brand">
                    <img src="/assets/logo.jpeg?v=2" alt="">
                    <div>
                        <div>Panel de administracion</div>
                        <div class="muted">Mensajes de contacto NicaSalud</div>
                    </div>
                </div>
                <div class="actions">
                    <a class="ghost" href="/nicasalud.html">Volver al sitio</a>
                    <?php if (!empty($_SESSION['admin_logged_in'])): ?>
                        <form method="post" action="/admin/">
                            <input type="hidden" name="action" value="logout">
                            <input type="hidden" name="csrf_token" value="<?= h($csrfToken) ?>">
                            <button class="ghost" type="submit">Salir</button>
                        </form>
                    <?php endif; ?>
                </div>
            </div>

            <?php if (!empty($_SESSION['admin_logged_in'])): ?>
                <div class="stats">
                    <div class="stat">
                        <span>Total de mensajes</span>
                        <strong><?= h((string) $stats['total']) ?></strong>
                    </div>
                    <div class="stat">
                        <span>Mensajes de hoy</span>
                        <strong><?= h((string) $stats['today']) ?></strong>
                    </div>
                    <div class="stat">
                        <span>Ultimo mensaje</span>
                        <strong><?= $stats['last'] ? h((string) $stats['last']['nombre']) : 'N/A' ?></strong>
                    </div>
                </div>
            <?php else: ?>
                <p class="message">Ingresa con tu cuenta de administracion para revisar y borrar mensajes recibidos.</p>
            <?php endif; ?>
        </section>

        <?php if (!empty($error)): ?>
            <p class="message error"><?= h($error) ?></p>
        <?php endif; ?>

        <?php if (empty($_SESSION['admin_logged_in'])): ?>
            <section class="login">
                <form class="login-grid" method="post" action="/admin/">
                    <input type="hidden" name="action" value="login">
                    <input type="hidden" name="csrf_token" value="<?= h($csrfToken) ?>">
                    <label>
                        Usuario
                        <input type="text" name="username" autocomplete="username" required>
                    </label>
                    <label>
                        Contrasena
                        <input type="password" name="password" autocomplete="current-password" required>
                    </label>
                    <button class="button" type="submit">Entrar al panel</button>
                </form>
                <p class="login-note">Credenciales por defecto definidas en Docker: <strong>admin / Admin123!</strong></p>
            </section>
        <?php else: ?>
            <section class="panel">
                <div class="toolbar">
                    <div>
                        <h2 style="margin:0 0 .35rem;">Mensajes recibidos</h2>
                        <p class="message">Revisa el contenido, filtra por texto y elimina lo que ya no necesites conservar.</p>
                    </div>
                    <input class="searchbox" type="search" id="adminSearch" placeholder="Buscar por nombre, correo o mensaje...">
                </div>

                <?php if (empty($messages)): ?>
                    <div class="empty">Todavía no hay mensajes guardados.</div>
                <?php else: ?>
                    <div class="table-wrap">
                        <table id="messagesTable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Fecha</th>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Mensaje</th>
                                    <th>Origen</th>
                                    <th>IP</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($messages as $message): ?>
                                    <tr>
                                        <td><span class="pill">#<?= h((string) $message['id']) ?></span></td>
                                        <td>
                                            <strong><?= h((string) $message['created_at']) ?></strong><br>
                                            <span class="muted"><?= h((string) ($message['pagina_origen'] ?? '')) ?></span>
                                        </td>
                                        <td><?= h((string) $message['nombre']) ?></td>
                                        <td><a href="mailto:<?= h((string) $message['correo']) ?>"><?= h((string) $message['correo']) ?></a></td>
                                        <td><?= h(excerpt((string) $message['mensaje'], 180)) ?></td>
                                        <td><?= h((string) ($message['user_agent'] ?? '')) ?></td>
                                        <td><?= h((string) ($message['ip_origen'] ?? '')) ?></td>
                                        <td>
                                            <form method="post" action="/admin/" onsubmit="return confirm('Eliminar este mensaje?');">
                                                <input type="hidden" name="action" value="delete">
                                                <input type="hidden" name="csrf_token" value="<?= h($csrfToken) ?>">
                                                <input type="hidden" name="id" value="<?= h((string) $message['id']) ?>">
                                                <button class="delete-btn" type="submit">Eliminar</button>
                                            </form>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </section>
        <?php endif; ?>
    </div>

    <script>
        const adminSearch = document.getElementById('adminSearch');
        const messagesTable = document.getElementById('messagesTable');

        if (adminSearch && messagesTable) {
            adminSearch.addEventListener('input', () => {
                const term = adminSearch.value.toLowerCase().trim();
                const rows = messagesTable.querySelectorAll('tbody tr');

                rows.forEach((row) => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(term) ? '' : 'none';
                });
            });
        }
    </script>
</body>
</html>

