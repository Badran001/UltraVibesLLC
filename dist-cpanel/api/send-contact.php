<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

$value = static function (string $key, int $maxLength = 500) use ($input): string {
    $value = trim((string)($input[$key] ?? ''));
    return substr($value, 0, $maxLength);
};

$name = $value('contact_name', 120);
$email = $value('email', 254);
$company = $value('company_name', 160);
$phone = $value('phone', 60);
$origin = $value('origin', 160);
$destination = $value('destination', 160);
$equipment = $value('equipment_type', 80);
$pickupDate = $value('pickup_date', 40);
$details = $value('freight_description', 3000);

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['error' => 'A valid name and email are required']);
    exit;
}

$to = 'contact@ultravibesllc.com';
$subject = 'Quote Request from ' . preg_replace('/[\r\n]+/', ' ', $name);
$message = implode("\n", [
    'Name: ' . ($name ?: 'N/A'),
    'Company: ' . ($company ?: 'N/A'),
    'Email: ' . $email,
    'Phone: ' . ($phone ?: 'N/A'),
    'Origin: ' . ($origin ?: 'N/A'),
    'Destination: ' . ($destination ?: 'N/A'),
    'Equipment: ' . ($equipment ?: 'N/A'),
    'Pickup Date: ' . ($pickupDate ?: 'N/A'),
    '',
    'Freight Details:',
    $details ?: 'No additional details provided.',
]);

$headers = implode("\r\n", [
    'From: UltraVibes Website <contact@ultravibesllc.com>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
]);

if (!mail($to, $subject, $message, $headers)) {
    http_response_code(500);
    echo json_encode(['error' => 'The server could not send the email']);
    exit;
}

echo json_encode(['success' => true]);