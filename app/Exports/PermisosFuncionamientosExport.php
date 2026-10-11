<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Events\AfterSheet;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class PermisosFuncionamientosExport implements 
    FromCollection, 
    WithHeadings, 
    WithStyles, 
    ShouldAutoSize, 
    WithEvents,
    WithCustomStartCell
{
    protected $institucion;
    protected $reporte;
    protected $permisos;

    public function __construct($institucion, $reporte, $permisos)
    {
        $this->institucion = $institucion;    
        $this->reporte = $reporte;    
        $this->permisos = $permisos;       
    }

    public function startCell(): string
    {
        return 'A6';
    }

    public function collection()
    {
        $total = $this->permisos->sum('valor_total');

        $rows = $this->permisos->map(function ($permiso, $index) {

            $actividad = '';
            $act = $permiso->procesoPermiso?->actividadEconomica;

            if ($act?->tipo_actividad == 'E') {
                $actividad = $act->e_nombre_comercial;
            } elseif ($act?->tipo_actividad == 'V') {
                $actividad =
                    $act->v_placa . "\n" .
                    $act->v_marca . ' ' .
                    $act->v_tipo . ' ' .
                    $act->v_clase . ' ' .
                    $act->v_color;
            }

            return [
                $index + 1,
                $permiso->numero_formateado,
                $permiso->procesoPermiso?->tipoPermiso?->nombre,
                $permiso->procesoPermiso?->cliente?->documento,
                $permiso->procesoPermiso?->cliente?->nombre,
                $actividad,
                optional($permiso->fecha_expedicion)->format('Y-m-d'),
                optional($permiso->fecha_caducidad)->format('Y-m-d'),
                $permiso->valor_total,
                optional($permiso->fecha_deposito)->format('Y-m-d'),
                $permiso->documento_deposito,
                $permiso->estado,
            ];
        });

        $rows->push([
            'TOTAL RECAUDADO',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            $total,
            '',
            '',
            ''
        ]);

        return $rows;
    }

    public function headings(): array
    {
        return [
            '#',
            'Número',
            'Tipo de permiso',
            'Documento',
            'Cliente',
            'Actividad económica',
            'Fecga expedición',
            'Fecha caducidad',
            'Valor',
            'Fecha depósito',
            'Documento depósito',
            'Estado'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {

                $sheet = $event->sheet->getDelegate();

                // 🖼️ LOGO
                $drawing = new Drawing();
                $drawing->setPath(public_path('images/logo1.jpg'));
                $drawing->setHeight(80);
                $drawing->setCoordinates('A1');
                $drawing->setWorksheet($sheet);

                // 🏛️ RAZÓN SOCIAL
                $sheet->mergeCells('A1:L1');
                $sheet->setCellValue('A1', $this->institucion->razon_social);
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
                $sheet->getStyle('A1')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // 🧾 RUC
                $sheet->mergeCells('A2:L2');
                $sheet->setCellValue('A2', 'RUC: ' . $this->institucion->ruc);
                $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(12);
                $sheet->getStyle('A2')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // 📑 REPORTE
                $titulo = $this->reporte->numero
                ? 'REPORTE DE RECAUDACIÓN DE PERMISOS DE FUNCIONAMIENTO N° ' . $this->reporte->numero
                : 'REPORTE DE RECAUDACIÓN DE PERMISOS DE FUNCIONAMIENTO';

                $sheet->mergeCells('A3:L3');
                $sheet->setCellValue('A3', $titulo);
                $sheet->getStyle('A3')->getFont()->setBold(true);
                $sheet->getStyle('A3')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // 📅 FECHA
                if (strtotime($this->reporte->fecha)) {
                    $fecha = \Carbon\Carbon::parse($this->reporte->fecha)
                        ->locale('es')
                        ->translatedFormat('d \d\e F \d\e Y');
                }else{
                    $fecha = $this->reporte->fecha;
                }

                $sheet->mergeCells('A4:L4');
                $sheet->setCellValue('A4', mb_strtoupper($fecha));
                $sheet->getStyle('A4')->getFont()->setBold(true);
                $sheet->getStyle('A4')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // 🔢 última fila REAL
                $lastRow = $sheet->getHighestDataRow();

                // 🎨 encabezado
                $sheet->getStyle('A6:L6')->applyFromArray([
                    'font' => ['bold' => true],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'D9D9D9'],
                    ],
                ]);

                // 🧱 bordes
                $sheet->getStyle("A6:L{$lastRow}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                        ],
                    ],
                ]);

                // 💰 moneda
                $sheet->getStyle("I7:I{$lastRow}")
                    ->getNumberFormat()
                    ->setFormatCode(NumberFormat::FORMAT_NUMBER_00);

                // 🎯 ALINEACIÓN GLOBAL (CLAVE)
                $sheet->getStyle("A6:L{$lastRow}")
                    ->getAlignment()
                    ->setVertical(Alignment::VERTICAL_CENTER)
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // 🔧 ajustes por columna
                $sheet->getStyle("E7:E{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_LEFT);

                $sheet->getStyle("F7:F{$lastRow}")
                    ->getAlignment()
                    ->setVertical(Alignment::VERTICAL_CENTER)
                    ->setHorizontal(Alignment::HORIZONTAL_LEFT)
                    ->setWrapText(true);

                // 🔁 recalcular altura (CLAVE para que no quede abajo)
                foreach (range(7, $lastRow) as $row) {
                    $sheet->getRowDimension($row)->setRowHeight(-1);
                }

                // 🔗 combinar A → H
                $sheet->mergeCells("A{$lastRow}:H{$lastRow}");

                // 🔗 combinar J → L
                $sheet->mergeCells("J{$lastRow}:L{$lastRow}");

                // 🎯 alinear texto
                $sheet->getStyle("A{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                // 🎨 fondo
                $sheet->getStyle("A{$lastRow}:J{$lastRow}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'FFF2CC'],
                    ],
                ]);

                // 🔠 negrita + tamaño
                $sheet->getStyle("A{$lastRow}:I{$lastRow}")
                    ->getFont()->setBold(true)->setSize(12);

                // 💰 TOTAL
                $sheet->getStyle("H{$lastRow}:I{$lastRow}")->applyFromArray([
                    'font' => ['bold' => true],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'FFF2CC'],
                    ],
                ]);
            },
        ];
    }
}