class MyQueue {
    private Deque<Integer> inbox = new ArrayDeque<>();
    private Deque<Integer> outbox = new ArrayDeque<>();

    public void push(int x) {
        inbox.push(x);
    }

    public int pop() {
        peek();
        return outbox.pop();
    }

    public int peek() {
        if (outbox.isEmpty()) {
            while (!inbox.isEmpty()) outbox.push(inbox.pop());
        }
        return outbox.peek();
    }

    public boolean empty() {
        return inbox.isEmpty() && outbox.isEmpty();
    }
}
