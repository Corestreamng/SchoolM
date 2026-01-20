<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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

        // Log the action
        AuditLog::logAction('payment.create', $payment, null, $payment->toArray());

        return response()->json($payment->load(['student.user']), 201);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        $oldValues = $payment->toArray();

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,completed,failed,refunded',
            'payment_method' => 'nullable|string',
            'paid_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'completed' && !isset($validated['paid_date'])) {
            $validated['paid_date'] = now();
        }

        $payment->update($validated);

        // Send notification if payment is completed
        if (isset($validated['status']) && $validated['status'] === 'completed') {
            $student = $payment->student()->with('user', 'parent.user')->first();
            
            if ($student && $student->user) {
                try {
                    // Send email to student
                    Mail::send('emails.message', [
                        'subject' => 'Payment Confirmation',
                        'content' => "Your payment of {$payment->amount} for {$payment->payment_type} has been confirmed. Transaction ID: {$payment->transaction_id}",
                    ], function ($message) use ($student) {
                        $message->to($student->user->email, $student->user->name)
                            ->subject('Payment Confirmation');
                    });

                    // Send email to parent if available
                    if ($student->parent && $student->parent->user) {
                        Mail::send('emails.message', [
                            'subject' => 'Payment Confirmation',
                            'content' => "Payment of {$payment->amount} for {$student->user->name} ({$payment->payment_type}) has been confirmed. Transaction ID: {$payment->transaction_id}",
                        ], function ($message) use ($student) {
                            $message->to($student->parent->user->email, $student->parent->user->name)
                                ->subject('Payment Confirmation');
                        });
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to send payment notification: ' . $e->getMessage());
                }
            }
        }

        // Log the action
        AuditLog::logAction('payment.update', $payment, $oldValues, $payment->fresh()->toArray());

        return response()->json($payment->load(['student.user']));
    }
}

