<?php

namespace App\Console\Commands;

use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class InstallFonts extends Command
{
    protected $signature = 'fonts:install';
    protected $description = 'Download and register the Cairo Arabic font for DomPDF';

    private array $fonts = [
        'Cairo' => [
            'normal'  => 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hGA-W1ToLQ.ttf',
            'bold'    => 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOK-W1ToLQ.ttf',
        ],
    ];

    public function handle(): int
    {
        $fontDir = storage_path('fonts');

        if (! is_dir($fontDir)) {
            mkdir($fontDir, 0755, true);
        }

        foreach ($this->fonts as $family => $variants) {
            foreach ($variants as $style => $url) {
                $filename = "{$fontDir}/{$family}-{$style}.ttf";

                if (file_exists($filename)) {
                    $this->line("  Already exists: {$family} {$style}");
                    continue;
                }

                $this->info("  Downloading {$family} {$style}...");

                $response = Http::timeout(30)->get($url);

                if (! $response->successful()) {
                    $this->error("  Failed to download {$family} {$style}: HTTP {$response->status()}");
                    return self::FAILURE;
                }

                file_put_contents($filename, $response->body());
                $this->line("  Saved: {$filename}");
            }

            // Register with DomPDF
            $this->registerFont($family, $fontDir);
        }

        $this->info('Fonts installed successfully.');
        return self::SUCCESS;
    }

    private function registerFont(string $family, string $fontDir): void
    {
        $options = new Options();
        $options->set('fontDir', $fontDir);
        $options->set('fontCache', $fontDir);

        $dompdf = new Dompdf($options);
        $fontMetrics = new \Dompdf\FontMetrics($dompdf->getCanvas(), $options);

        $normalPath = "{$fontDir}/{$family}-normal.ttf";
        $boldPath   = "{$fontDir}/{$family}-bold.ttf";

        // Register normal
        if (file_exists($normalPath)) {
            $fontMetrics->registerFont(
                ['family' => $family, 'weight' => 'normal', 'style' => 'normal'],
                $normalPath
            );
        }

        // Register bold
        if (file_exists($boldPath)) {
            $fontMetrics->registerFont(
                ['family' => $family, 'weight' => 'bold', 'style' => 'normal'],
                $boldPath
            );
        }

        $this->line("  Registered font family: {$family}");
    }
}
