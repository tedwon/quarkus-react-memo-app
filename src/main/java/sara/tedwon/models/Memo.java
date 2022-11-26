package sara.tedwon.models;

import java.util.Objects;

public class Memo {

    private String memo;

    public Memo() {
    }

    public Memo(String memo) {
        this.memo = memo;
    }

    public String getMemo() {
        return memo;
    }

    public void setMemo(String memo) {
        this.memo = memo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Memo memo1 = (Memo) o;
        return Objects.equals(memo, memo1.memo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(memo);
    }

    @Override
    public String toString() {
        return "Memo{" +
                "memo='" + memo + '\'' +
                '}';
    }
}
