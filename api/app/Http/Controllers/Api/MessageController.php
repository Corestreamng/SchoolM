<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\ParentModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Message::with(['sender', 'receiver'])
            ->where(function ($q) use ($user) {
                $q->where('sender_id', $user->id)
                    ->orWhere('receiver_id', $user->id);
            });

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('unread_only')) {
            $query->where('receiver_id', $user->id)
                ->where('status', 'unread');
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'nullable|exists:users,id',
            'recipient_type' => 'nullable|in:all_parents,all_teachers,specific_parents,specific_teachers',
            'recipient_ids' => 'nullable|array',
            'recipient_ids.*' => 'exists:users,id',
            'subject' => 'nullable|string',
            'message' => 'required|string',
            'send_email' => 'nullable|boolean',
        ]);

        $sender = $request->user();
        $messages = [];
        $recipients = [];

        // Determine recipients based on recipient_type
        if ($validated['recipient_type'] === 'all_parents') {
            $parentUsers = User::where('role', 'parent')->get();
            $recipients = $parentUsers->pluck('id')->toArray();
        } elseif ($validated['recipient_type'] === 'all_teachers') {
            $teacherUsers = User::where('role', 'teacher')->get();
            $recipients = $teacherUsers->pluck('id')->toArray();
        } elseif ($validated['recipient_type'] === 'specific_parents' && !empty($validated['recipient_ids'])) {
            $recipients = $validated['recipient_ids'];
        } elseif ($validated['recipient_type'] === 'specific_teachers' && !empty($validated['recipient_ids'])) {
            $recipients = $validated['recipient_ids'];
        } elseif (!empty($validated['receiver_id'])) {
            $recipients = [$validated['receiver_id']];
        } else {
            return response()->json(['message' => 'No recipients specified'], 422);
        }

        // Create messages and send emails
        foreach ($recipients as $receiverId) {
            $message = Message::create([
                'sender_id' => $sender->id,
                'receiver_id' => $receiverId,
                'subject' => $validated['subject'] ?? null,
                'message' => $validated['message'],
                'status' => 'unread',
            ]);

            $messages[] = $message;

            // Send email if requested
            if ($validated['send_email'] ?? false) {
                try {
                    $receiver = User::find($receiverId);
                    if ($receiver && $receiver->email) {
                        Mail::send('emails.message', [
                            'senderName' => $sender->name,
                            'subject' => $validated['subject'] ?? 'Message from ' . $sender->name,
                            'messageContent' => $validated['message'],
                        ], function ($mail) use ($receiver, $validated, $sender) {
                            $mail->to($receiver->email, $receiver->name)
                                ->subject($validated['subject'] ?? 'Message from ' . $sender->name);
                        });
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to send email to user ' . $receiverId . ': ' . $e->getMessage());
                }
            }
        }

        return response()->json([
            'message' => 'Messages sent successfully',
            'count' => count($messages),
            'messages' => Message::whereIn('id', collect($messages)->pluck('id'))->with(['sender', 'receiver'])->get(),
        ], 201);
    }

    public function markAsRead(Request $request, $id)
    {
        $message = Message::where('receiver_id', $request->user()->id)
            ->findOrFail($id);

        $message->update([
            'status' => 'read',
            'read_at' => now(),
        ]);

        return response()->json($message->load(['sender', 'receiver']));
    }
}
