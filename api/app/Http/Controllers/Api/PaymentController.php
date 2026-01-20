<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['student.user', 'processedBy']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'payment_type' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'nullable|string',
            'transaction_id' => 'nullable|string|unique:payments,transaction_id',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $validated['status'] = 'pending';
        $validated['processed_by'] = $request->user()->id;

        $payment = Payment::create($validated);

        return response()->json($payment->load(['student.user']), 201);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,completed,failed,refunded',
            'payment_method' => 'nullable|string',
            'paid_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if ($validated['status'] === 'completed' && !isset($validated['paid_date'])) {
            $validated['paid_date'] = now();
        }

        $payment->update($validated);

        return response()->json($payment->load(['student.user']));
    }
}

