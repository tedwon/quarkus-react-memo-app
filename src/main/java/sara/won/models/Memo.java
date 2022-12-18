package sara.won.models;

import java.io.Serializable;
import java.util.Objects;

public class Memo implements Serializable {

    public String title;

    public String memo;

    public String tags;

    public Memo() {
    }

    public Memo(String title) {
        this.title = title;
    }

    public Memo(String title, String memo, String tags) {
        this.title = title;
        this.memo = memo;
        this.tags = tags;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Memo memo1 = (Memo) o;
        return Objects.equals(title, memo1.title) && Objects.equals(memo, memo1.memo) && Objects.equals(tags, memo1.tags);
    }

    @Override
    public int hashCode() {
        return Objects.hash(title, memo, tags);
    }

    @Override
    public String toString() {
        return "Memo{" +
                "title='" + title + '\'' +
                ", memo='" + memo + '\'' +
                ", tags=" + tags +
                '}';
    }
}
