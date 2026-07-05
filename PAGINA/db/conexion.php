<?php
declare(strict_types=1);

function nicasalud_db_config(): array
{
    return [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => (int) (getenv('DB_PORT') ?: 3306),
        'user' => getenv('DB_USER') ?: 'root',
        'password' => getenv('DB_PASSWORD') ?: '',
        'database' => getenv('DB_NAME') ?: 'nicasalud_contactos',
    ];
}

function nicasalud_db_connection(): mysqli
{
    $config = nicasalud_db_config();

    $connection = new mysqli(
        $config['host'],
        $config['user'],
        $config['password'],
        $config['database'],
        $config['port']
    );

    if ($connection->connect_error) {
        throw new RuntimeException('No se pudo conectar a MySQL: ' . $connection->connect_error);
    }

    $connection->set_charset('utf8mb4');

    return $connection;
}
