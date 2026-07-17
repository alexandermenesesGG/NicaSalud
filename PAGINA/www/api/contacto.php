<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Usa el formulario para enviar mensajes.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/../../db/conexion.php';

function recortar_texto(string $valor, int $maximo): string
{
    if (function_exists('mb_strlen') && function_exists('mb_substr')) {
        return mb_strlen($valor) > $maximo ? mb_substr($valor, 0, $maximo) : $valor;
    }

    return strlen($valor) > $maximo ? substr($valor, 0, $maximo) : $valor;
}

$nombre = trim((string) ($_POST['nombre'] ?? ''));
$correo = trim((string) ($_POST['correo'] ?? ''));
$mensaje = trim((string) ($_POST['mensaje'] ?? ''));
$pagina = trim((string) ($_POST['pagina'] ?? ''));
$ipOrigen = $_SERVER['REMOTE_ADDR'] ?? null;
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

$nombre = recortar_texto($nombre, 120);
$correo = recortar_texto($correo, 190);
$mensaje = recortar_texto($mensaje, 5000);
$pagina = recortar_texto($pagina, 190);
$ipOrigen = $ipOrigen !== null ? recortar_texto($ipOrigen, 45) : null;
$userAgent = $userAgent !== null ? recortar_texto($userAgent, 255) : null;

if ($nombre === '' || $correo === '' || $mensaje === '') {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Completa nombre, correo y mensaje.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Ingresa un correo electrónico válido.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = nicasalud_db_connection();

    $statement = $db->prepare(
        'INSERT INTO contactos (nombre, correo, mensaje, pagina_origen, ip_origen, user_agent)
         VALUES (?, ?, ?, ?, ?, ?)'
    );

    if (!$statement) {
        throw new RuntimeException('No se pudo preparar el registro.');
    }

    $statement->bind_param('ssssss', $nombre, $correo, $mensaje, $pagina, $ipOrigen, $userAgent);
    $statement->execute();
    $statement->close();
    $db->close();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Tu mensaje se guardó correctamente. Lo podrás revisar en MySQL.'
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'No se pudo guardar el mensaje. Revisa la conexión a MySQL y la configuración del servidor.'
    ], JSON_UNESCAPED_UNICODE);
}

